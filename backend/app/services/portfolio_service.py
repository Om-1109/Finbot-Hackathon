import json
import random
from pathlib import Path
from typing import List, Dict, Any

# (Your models imports are all the same)
from app.models.portfolio_models import (
    PortfolioRequest,
    PortfolioResponse,
    AllocationDetails,
    Recommendation
)

# (Your DB loading and _load_json_data function are all the same)
# ...
DATA_DIR = Path(__file__).parent.parent / "data"
STOCKS_DB = _load_json_data(DATA_DIR / "direct_equity.json")
EQUITY_FUNDS_DB = _load_json_data(DATA_DIR / "equity_funds.json")
DEBT_DB = _load_json_data(DATA_DIR / "debt_instruments.json")
GOLD_DB = _load_json_data(DATA_DIR / "gold_instruments.json")
# ... etc ...
ASSET_CLASS_TO_DB = {
    "Direct Equity": STOCKS_DB,
    "Equity Funds": EQUITY_FUNDS_DB,
    "Debt Instruments": DEBT_DB,
    "Gold": GOLD_DB,
}

# --- THIS IS THE NEW HELPER FUNCTION ---
def _get_normalized_rules(rules: dict) -> dict:
    """
    Takes a dict of allocations (e.g., {"Equity": 0.5, "Debt": 0.55})
    and normalizes them to sum to 1.0.
    """
    total = sum(rules.values())
    if total == 0:
        return rules # Avoid division by zero
        
    # This line divides each value by the total, forcing the sum to 1.0
    normalized_rules = {asset: (perc / total) for asset, perc in rules.items()}
    return normalized_rules

# --- THIS IS THE UPGRADED CORE FUNCTION ---
def generate_portfolio(request: PortfolioRequest) -> PortfolioResponse:
    """
    Generates a personalized investment portfolio that is ADJUSTED
    based on user preferences.
    """
    
    # 1. Define BASELINE allocation rules
    if request.risk_appetite == 'low':
        base_rules = {"Debt Instruments": 0.7, "Gold": 0.2, "Equity Funds": 0.1}
        projected_return = "6-8% p.a."
    
    elif request.risk_appetite == 'medium':
        base_rules = {"Equity Funds": 0.4, "Debt Instruments": 0.4, "Direct Equity": 0.1, "Gold": 0.1}
        projected_return = "9-12% p.a."
    
    elif request.risk_appetite == 'high':
        base_rules = {"Direct Equity": 0.4, "Equity Funds": 0.3, "Debt Instruments": 0.2, "Gold": 0.1}
        projected_return = "12-15% p.a."
    
    else:
        raise ValueError(f"Invalid risk_appetite: {request.risk_appetite}")

    # --- 2. THIS IS THE NEW "SMART" LOGIC ---
    # Create a copy of the rules to safely modify
    adjusted_rules = base_rules.copy()
    
    # Define how preferences map to our asset classes
    # (e.g., if user says "stocks", we boost "Direct Equity")
    preference_map = {
        "stocks": "Direct Equity",
        "mutual funds": "Equity Funds",
        "bonds": "Debt Instruments",
        "debt funds": "Debt Instruments",
        "gold": "Gold"
    }

    # Define a "boost" factor
    # We will increase a preferred asset's share by 20%
    BOOST_FACTOR = 1.20 

    for user_pref in request.preferred_tools:
        # Normalize the user's preference (e.g., "Stocks" -> "stocks")
        normalized_pref = user_pref.lower().strip()
        
        # Find the asset class that matches this preference
        asset_to_boost = preference_map.get(normalized_pref)
        
        # If it's a valid preference and in our rules, boost it
        if asset_to_boost and asset_to_boost in adjusted_rules:
            print(f"User preference detected: Boosting '{asset_to_boost}'")
            adjusted_rules[asset_to_boost] *= BOOST_FACTOR

    # 3. NORMALIZE the adjusted rules to ensure they sum to 100%
    # This is the secret sauce!
    final_allocation_rules = _get_normalized_rules(adjusted_rules)
    # --- END OF NEW LOGIC ---


    # Create the two empty lists to hold your plans
    lump_sum_plan: List[AllocationDetails] = []
    sip_plan: List[AllocationDetails] = []

    # 4. Iterate through the FINAL (normalized) rules
    for asset_class, percentage in final_allocation_rules.items():
        
        # (All this code from here is the same as you already have)
        
        # --- Get Recommendations ---
        source_db = ASSET_CLASS_TO_DB.get(asset_class, [])
        num_to_pick = min(len(source_db), 2)
        picked_items = random.sample(source_db, num_to_pick)
        recommendations_list = [
            Recommendation(
                name=item.get('name', 'N/A'),
                details=item.get('details', item.get('category', 'No details available.'))
            ) for item in picked_items
        ]

        # --- Calculate and add to LUMP SUM plan ---
        lump_sum_amount = int(request.capital * percentage)
        lump_sum_plan.append(
            AllocationDetails(
                asset_class=asset_class,
                amount=lump_sum_amount,
                percentage=percentage,
                recommendations=recommendations_list 
            )
        )

        # --- Calculate and add to SIP plan ---
        sip_amount = int(request.monthly_investment * percentage)
        if sip_amount > 0:
            sip_plan.append(
                AllocationDetails(
                    asset_class=asset_class,
                    amount=sip_amount,
                    percentage=percentage,
                    recommendations=recommendations_list
                )
            )

    # 5. Build and return the final response
    return PortfolioResponse(
        risk_profile=request.risk_appetite,
        projected_return_estimate=projected_return,
        lump_sum_allocation=lump_sum_plan,
        monthly_sip_allocation=sip_plan
    )

# ... (Your __main__ test block stays the same) ...