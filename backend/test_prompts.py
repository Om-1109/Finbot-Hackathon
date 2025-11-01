# test_prompts.py
# Place this file in the backend folder (the same folder where `app` and `venv` exist).

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("LLAMA_API_URL", "http://localhost:11434/api/generate")
MODEL = os.getenv("LLAMA_MODEL", "llama3.1:8b")

def call(prompt: str):
    print("\n--- Prompt ---")
    print(prompt)
    print("Calling:", URL, "model:", MODEL)
    try:
        r = httpx.post(URL, json={"model": MODEL, "prompt": prompt, "max_tokens": 256, "stream": False}, timeout=60.0)
        print("Status:", r.status_code)
        text = r.text
        print("--- RAW RESPONSE (first 2000 chars) ---")
        print(text[:2000])
        try:
            print("\n--- PARSED JSON (first-level) ---")
            print(r.json())
        except Exception as e:
            print("\n(not JSON parseable):", e)
    except Exception as e:
        print("Request failed:", e)

if __name__ == "__main__":
    prompt1 = (
        "You are a JSON-only bot. Analyze: 'I want a portfolio with capital 50000 and monthly 2000, risk medium, prefer Zerodha'. "
        "Classify intent: general_question, portfolio_request, or providing_info. "
        "Extract entities: capital (int), monthly_investment (int), risk_appetite ('low','medium','high'), preferred_tools (list of strings). "
        "Return ONLY the JSON."
    )

    prompt2 = "You are FinBot, an expert on Indian finance. Answer concisely: 'What is SIP?'"

    prompt3 = (
        "You are FinBot. Your internal engine generated this portfolio: "
        "'{\"capital\":50000, \"allocation\":{\"Equity\":30000, \"Debt\":15000}}'. "
        "Present this to the user in a friendly, formatted, and encouraging way. Explain the breakdown."
    )

    call(prompt1)
    call(prompt2)
    call(prompt3)
