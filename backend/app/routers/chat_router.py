from fastapi import APIRouter, HTTPException, status
import asyncio
from typing import Dict, Any, List

from app.models.api_models import ChatRequest, ChatResponse
from app.chat_state import get_session_data, update_session_data
from app.services import llm_service

# Internal imports from Person 3 (direct python import, assumed available)
from app.services.portfolio_service import generate_portfolio
from app.models.portfolio_models import PortfolioRequest

router = APIRouter()

# Required keys for portfolio flow
REQUIRED_KEYS = ["capital", "monthly_investment", "risk_appetite", "preferred_tools"]

FOLLOW_UP_QUESTIONS = {
    "capital": "What's the total capital (in INR) you'd like to invest?",
    "monthly_investment": "How much can you invest monthly (in INR)?",
    "risk_appetite": "What's your risk appetite? (low, medium, or high)",
    "preferred_tools": "Do you prefer any specific tools/platforms? (e.g., Zerodha, Groww)",
}


@router.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    session_id = req.session_id
    message = req.message

    # 1) load session data (async)
    session = await get_session_data(session_id)

    # 2) classify intent and extract entities
    classification = await llm_service.classify_intent_and_extract(message)
    intent = classification.get("intent", "general_question")
    entities = classification.get("entities", {}) or {}

    # 3) update session_data with any new entities (only expected keys)
    valid_updates = {k: v for k, v in entities.items() if v is not None}
    if valid_updates:
        await update_session_data(session_id, valid_updates)

    # reload session after update
    session = await get_session_data(session_id)

    # 4) --- THIS IS THE UPDATED LOGIC ---
    #
    # Handle the most specific case first: Portfolio Flow
    if intent in ("portfolio_request", "providing_info"):
        # Check for missing keys in session
        missing = [
            k
            for k in REQUIRED_KEYS
            if k not in session or session.get(k) in (None, "")
        ]
        if missing:
            # Ask for the first missing key
            question = FOLLOW_UP_QUESTIONS.get(missing[0], "Can you provide more details?")
            return ChatResponse(response_type="text", content=question)

        # All keys present -> build PortfolioRequest
        try:
            # Normalize preferred_tools into a list
            preferred_tools = session.get("preferred_tools", [])
            if isinstance(preferred_tools, str):
                preferred_tools_list = [
                    t.strip() for t in preferred_tools.split(",") if t.strip()
                ]
            elif isinstance(preferred_tools, list):
                preferred_tools_list = preferred_tools
            else:
                preferred_tools_list = []

            portfolio_req = PortfolioRequest(
                capital=int(session.get("capital")),
                monthly_investment=int(session.get("monthly_investment")),
                risk_appetite=str(session.get("risk_appetite")),
                preferred_tools=preferred_tools_list,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid session data for portfolio creation: {e}",
            )

        # Call generate_portfolio (might be sync) in a thread to avoid blocking
        try:
            portfolio_result = await asyncio.to_thread(generate_portfolio, portfolio_req)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating portfolio: {e}",
            )

        # Serialize portfolio_result robustly for the LLM and response
        if hasattr(portfolio_result, "model_dump"):
            portfolio_dict = portfolio_result.model_dump()
        elif hasattr(portfolio_result, "dict"):
            portfolio_dict = portfolio_result.dict()
        elif isinstance(portfolio_result, dict):
            portfolio_dict = portfolio_result
        else:
            # fallback to string representation
            portfolio_dict = {"result": str(portfolio_result)}

        # Ask LLM to present the portfolio nicely
        formatted_text = await llm_service.present_portfolio(portfolio_dict)

        return ChatResponse(
            response_type="portfolio",
            content=formatted_text,
            portfolio_data=portfolio_dict,
        )

    # Handle ALL OTHER cases (general_question, greeting, goodbye, etc.)
    # as a general Q&A.
    else:
        answer = await llm_service.answer_general_question(message)
        return ChatResponse(response_type="text", content=answer)

    # This fallback is no longer reachable, which is good.