# (Keep all your other imports: httpx, YourLlmApiClient, etc.)
import json 
# ... other llm_service.py code ...

# This is your existing function to answer general questions
async def answer_general_question(message: str):
    # ... (your existing logic for this) ...
    pass

# THIS IS THE UPGRADED FUNCTION:
async def present_portfolio(portfolio_dict: dict) -> str:
    """
    Uses the LLM to write a natural language summary of the new
    portfolio object (which includes lump sum and SIP).
    """
    
    # 1. Check what kind of plan we have.
    #    We check the SIP allocation to see if it's meaningful (not just ₹0).
    has_lump_sum = "lump_sum_allocation" in portfolio_dict and portfolio_dict["lump_sum_allocation"]
    
    # Check if a monthly plan exists and has a total > 0
    has_sip_plan = False
    if "monthly_sip_allocation" in portfolio_dict and portfolio_dict["monthly_sip_allocation"]:
        sip_total = sum(item.get('amount', 0) for item in portfolio_dict["monthly_sip_allocation"])
        if sip_total > 0:
            has_sip_plan = True

    # 2. Create a "smart" prompt based on the data.
    
    # --- Start of the Prompt ---
    prompt = "You are a friendly, encouraging financial advisor. "
    prompt += "You just generated a new investment plan for a user. "
    prompt += "Your job is to present this plan to them in a brief, 2-3 sentence summary. Be natural and clear."
    prompt += "\n"
    
    # Add context based on the plans
    if has_lump_sum and has_sip_plan:
        prompt += "The user has provided both a one-time 'lump sum' and a 'monthly SIP' amount. "
        prompt += "Acknowledge that you have created two separate, balanced plans for them. "
        prompt += "Example: 'Great! I've built a complete financial plan for you. It includes a strategy for your lump sum *and* a separate plan for your monthly SIP. Here are the details.'"
    
    elif has_lump_sum:
        prompt += "The user has provided a one-time 'lump sum' amount. "
        prompt += "Acknowledge that you have created a plan for this. "
        prompt += "Example: 'Okay, I've created a custom, diversified plan for your lump sum investment. Here's the breakdown.'"
    
    elif has_sip_plan:
        prompt += "The user has provided a 'monthly SIP' amount. "
        prompt += "Acknowledge that you have created a plan for their monthly investments. "
        prompt += "Example: 'Perfect! I've created a diversified plan for your monthly SIP. Here's how it's allocated.'"

    prompt += "\n\n"
    prompt += "Here is the raw data of the plan (do NOT just repeat this JSON): "
    
    # Safely dump the dict to a JSON string for the prompt
    prompt += json.dumps(portfolio_dict)
    # --- End of the Prompt ---

    # 3. Call your LLM (This part assumes you have a helper)
    #    You can replace this with your actual Llama 3.1 call.
    try:
        # This is just an example of how you might be calling your LLM
        # You should adapt this line to your project's code.
        # e.g., return await _call_your_llm_api(prompt)
        
        # For the sake of this example, I'll assume you have a generic helper:
        return await _call_llm(prompt)
        
    except Exception as e:
        print(f"Error in present_portfolio LLM call: {e}")
        # Fallback in case the LLM fails
        return "I've generated your portfolio! Here are the details."

# --- Helper Function (Assumed) ---
# You probably already have a function like this in this file
# to talk to the Llama 3.1 API.
async def _call_llm(prompt: str) -> str:
    # This is a MOCKUP.
    # Replace this with your actual httpx call to Llama 3.1
    
    # --- START MOCKUP ---
    # In your real code, you would do:
    # response = await httpx_client.post(LLAMA_URL, json={"prompt": prompt, ...})
    # return response.json()["choices"][0]["text"]
    
    # This is just so the file is complete.
    if "lump sum and" in prompt:
        return "Great! I've built a complete financial plan for you. It includes a strategy for your lump sum *and* a separate plan for your monthly SIP. Here are the details."
    else:
        return "Okay, I've created a custom, diversified plan for your investment. Here's the breakdown."
    # --- END MOCKUP ---


# (This is your other function, unchanged)
async def classify_intent_and_extract(message: str):
    # ... (your existing logic for this) ...
    pass