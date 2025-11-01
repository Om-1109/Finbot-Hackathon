import os
import json
from typing import Any, Dict, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY", "")
LLAMA_API_URL = os.getenv("LLAMA_API_URL", "http://localhost:11434/api/generate")
DEFAULT_MODEL = os.getenv("LLAMA_MODEL", "llama3.1:8b")  # Ollama-style model name

class LlamaClient:
    # --- BUG 1 FIX ---
    # Was: def init(self):
    def __init__(self):
        # Use a single AsyncClient for pooling
        self._client = httpx.AsyncClient(timeout=60.0)

    async def generate(
        self, prompt: str, max_tokens: int = 512, model: Optional[str] = None
    ) -> str:
        """
        Robust generation:
        - Attempts to request a non-streaming response (stream=False).
        - If server returns NDJSON / streamed chunks, parse them and concat text pieces.
        - Fallback to parsing common JSON shapes (choices, output, generated_text, response, text).
        Returns a clean string (final text).
        """
        model_name = model or DEFAULT_MODEL
        payload = {
            "model": model_name,
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": 0.2,
            # Many providers accept "stream": False to return a single final JSON.
            # If provider ignores this and streams, we handle NDJSON below.
            "stream": False,
        }

        headers = {"Content-Type": "application/json"}
        if LLAMA_API_KEY:
            headers["Authorization"] = f"Bearer {LLAMA_API_KEY}"

        resp = await self._client.post(LLAMA_API_URL, json=payload, headers=headers)
        resp.raise_for_status()

        # Try to parse as JSON first
        try:
            data = resp.json()
        except Exception:
            # Could be NDJSON stream or plain text. Attempt to parse NDJSON lines.
            text = resp.text
            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            collected: list[str] = []

            for line in lines:
                try:
                    obj = json.loads(line)
                except Exception:
                    # not JSON — skip
                    continue

                # Common keys where chunk text may appear
                if isinstance(obj, dict):
                    # Ollama-style streaming often uses "response"
                    if "response" in obj and isinstance(obj["response"], str):
                        collected.append(obj["response"])
                        continue
                    # Other probable keys
                    for k in ("generated_text", "text", "output", "content"):
                        if k in obj and isinstance(obj[k], str):
                            collected.append(obj[k])
                            break
            
            if collected:
                result = "".join(collected).strip()
                # --- BUG 2 FIX ---
                # Was: if result.startswith("") and result.endswith(""):
                if result.startswith("") and result.endswith(""):
                    result = result.strip("`\n ")
                    if result.startswith("json"): # Handle json
                        result = result[4:]
                return result

            # Final fallback: return raw body
            return text.strip()

        # If we have a parsed JSON data, search for the best text
        def find_first_string(obj: Any) -> Optional[str]:
            if isinstance(obj, str):
                return obj
            if isinstance(obj, dict):
                for v in obj.values():
                    s = find_first_string(v)
                    if s:
                        return s
            if isinstance(obj, list):
                for item in obj:
                    s = find_first_string(item)
                    if s:
                        return s
            return None

        # 1) OpenAI-like shapes: {"choices":[{"message":{"content":"..."}}]} or {"choices":[{"text":"..."}]}
        try:
            choices = data.get("choices")
            if isinstance(choices, list) and choices:
                first = choices[0]
                if isinstance(first, dict):
                    # Chat style
                    msg = first.get("message")
                    if isinstance(msg, dict) and msg.get("content"):
                        return str(msg["content"]).strip()
                    # Completion style
                    if first.get("text"):
                        return str(first["text"]).strip()
                    # Delta style
                    delta = first.get("delta")
                    if isinstance(delta, dict) and delta.get("content"):
                        return str(delta["content"]).strip()
        except Exception:
            pass

        # 2) Direct keys
        for key in ("response", "output", "generated_text", "text", "content", "result"):
            val = data.get(key) if isinstance(data, dict) else None
            if isinstance(val, str):
                return val.strip()

        # 3) If top-level is a list of dicts (some providers)
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            for candidate_key in ("generated_text", "text", "output", "response", "content"):
                if data[0].get(candidate_key):
                    return str(data[0][candidate_key]).strip()
            first_string = find_first_string(data[0])
            if first_string:
                return first_string.strip()

        # 4) Fallback: find first string anywhere
        fallback = find_first_string(data)
        if fallback:
            out = fallback.strip()
            # --- BUG 2 FIX ---
            # Was: if out.startswith("") and out.endswith(""):
            if out.startswith("") and out.endswith(""):
                out = out.strip("`\n ")
                if out.startswith("json"):
                    out = out[4:]
            return out

        # 5) Final fallback: return JSON as string
        return json.dumps(data)


# Singleton client instance
_llama_client: Optional[LlamaClient] = None

def get_llama_client() -> LlamaClient:
    global _llama_client
    if _llama_client is None:
        _llama_client = LlamaClient()
    return _llama_client


# ---- High level helper functions used by the router ----

async def classify_intent_and_extract(message: str) -> Dict[str, Any]:
    """
    Ask the model to return JSON-only classification + entities.
    Expected return (example):
    {"intent":"portfolio_request", "entities":{"capital":50000, "monthly_investment":2000, "risk_appetite":"medium", "preferred_tools":["Zerodha"]}}
    """
    safe_message = message.replace("\n", " ").replace("'", "\\'")
    prompt = (
        "You are a JSON-only bot. Analyze: '"
        + safe_message
        + "'. "
          "Classify intent: general_question, portfolio_request, or providing_info. "
          "Extract entities: capital (int), monthly_investment (int), risk_appetite ('low', 'medium', 'high'), "
          "preferred_tools (list of strings). Return ONLY the JSON. "
          "Example: {\"intent\": \"portfolio_request\", \"entities\": {\"capital\": 50000}}"
    )

    client = get_llama_client()
    raw = await client.generate(prompt, max_tokens=256)
    text = raw.strip()

    # Remove code fences if present
    # --- BUG 2 FIX ---
    # Was: if text.startswith("") and text.endswith(""):
    if text.startswith("") and text.endswith(""):
        text = text.strip("`\n ")
        if text.startswith("json"):
            text = text[4:]

    # Try parse JSON directly, else extract first {...} block
    try:
        parsed = json.loads(text)
        return parsed
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            substring = text[start : end + 1]
            try:
                parsed = json.loads(substring)
                return parsed
            except Exception:
                pass

    # Safe default if parsing fails
    return {"intent": "general_question", "entities": {}}


async def answer_general_question(message: str) -> str:
    """
    Ask FinBot (expert on Indian finance) for a concise answer.
    """
    escaped = message.replace('"', '\\"')
    prompt = f"You are FinBot, an expert on Indian finance. Answer concisely: \"{escaped}\""
    client = get_llama_client()
    raw = await client.generate(prompt, max_tokens=256)
    text = raw.strip()
    # --- BUG 2 FIX ---
    # Was: if text.startswith("") and text.endswith(""):
    if text.startswith("") and text.endswith(""):
        text = text.strip("`\n ")
    return text


async def present_portfolio(portfolio_json: Dict[str, Any]) -> str:
    """
    Ask FinBot to present a portfolio dict in a friendly formatted way.
    """
    json_text = json.dumps(portfolio_json, ensure_ascii=False)
    prompt = (
        f"You are FinBot. Your internal engine generated this portfolio: '{json_text}'. "
        "Present this to the user in a friendly, formatted, and encouraging way. Explain the breakdown."
    )
    client = get_llama_client()
    raw = await client.generate(prompt, max_tokens=512)
    text = raw.strip()
    # --- BUG 2 FIX ---
    # Was: if text.startswith("") and text.endswith(""):
    if text.startswith("") and text.endswith("```"):
        text = text.strip("`\n ")
    return text