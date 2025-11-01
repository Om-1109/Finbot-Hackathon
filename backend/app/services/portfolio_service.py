import json
import random
from pathlib import Path
from typing import List, Dict, Any

# --- TASK 2: IMPORT NEW MODELS ---
from app.models.portfolio_models import (
    PortfolioRequest,
    PortfolioResponse,
    AllocationDetails,  # <-- Import your new reusable model
    Recommendation
)

# --- ASSUMED SETUP (from your existing project) ---
DATA_DIR = Path(__file__).parent.parent / "data"

def _load_json_data(filepath: Path) -> List[Dict[str, Any]]:
    """Helper function to load and parse a JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Data file not found at {filepath}")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {filepath}")
        return []

# Load all databases (using the 4-file structure we discussed)
STOCKS_DB = _load_json_data(DATA_DIR / "direct_equity.json")
EQUITY_FUNDS_DB = _load_json_data(DATA_DIR / "equity_funds.json")
DEBT_DB = _load_json_data(DATA_DIR / "debt_instruments.json")
GOLD_DB = _load_json_data(DATA_DIR / "gold_instruments.json")

ASSET_CLASS_TO_DB = {
    "Direct Equity": STOCKS_DB,
    "Equity Funds": EQUITY_FUNDS_DB,
    "Debt Instruments": DEBT_DB,
    "Gold": GOLD_DB,
}
# --- END OF ASSUMED SETUP ---


# --- TASK 2: UPGRADED CORE FUNCTION ---
def generate_portfolio(request: PortfolioRequest) -> PortfolioResponse:
    """
    Generates a personalized investment portfolio for BOTH
    lump sum (capital) and monthly (SIP) investments.
    """
    
    # 1. Define allocation rules (this logic is in ONE place)
    if request.risk_appetite == 'low':
        allocation_rules = {"Debt Instruments": 0.7, "Gold": 0.2, "Equity Funds": 0.1}
        projected_return = "6-8% p.a."
    
    elif request.risk_appetite == 'medium':
        allocation_rules = {"Equity Funds": 0.4, "Debt Instruments": 0.4, "Direct Equity": 0.1, "Gold": 0.1}
        projected_return = "9-12% p.a."
    
    elif request.risk_appetite == 'high':
        allocation_rules = {"Direct Equity": 0.4, "Equity Funds": 0.3, "Debt Instruments": 0.2, "Gold": 0.1}
        projected_return = "12-15% p.a."
    
    else:
        raise ValueError(f"Invalid risk_appetite: {request.risk_appetite}")

    # Create the two empty lists to hold your plans
    lump_sum_plan: List[AllocationDetails] = []
    sip_plan: List[AllocationDetails] = []

    # 2. Iterate through the rules ONCE
    for asset_class, percentage in allocation_rules.items():
        
        # --- Get Recommendations (common for both plans) ---
        source_db = ASSET_CLASS_TO_DB.get(asset_class, [])
        num_to_pick = min(len(source_db), 2) # Get 2 recommendations
        picked_items = random.sample(source_db, num_to_pick)
        recommendations_list = [
            Recommendation(
                name=item.get('name', 'N/A'),
                details=item.get('details', item.get('category', 'No details available.'))
            ) for item in picked_items
        ]

        # --- 3. Calculate and add to the LUMP SUM plan ---
        lump_sum_amount = int(request.capital * percentage)
        lump_sum_plan.append(
            AllocationDetails(
                asset_class=asset_class,
                amount=lump_sum_amount,
                percentage=percentage,
                recommendations=recommendations_list 
            )
        )

        # --- 4. Calculate and add to the SIP plan ---
        sip_amount = int(request.monthly_investment * percentage)
        
        # Only add SIP recommendations if the SIP amount is > 0
        # (Avoids showing "₹0" in the SIP plan)
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
        lump_sum_allocation=lump_sum_plan,  # <-- Pass the lump sum plan
        monthly_sip_allocation=sip_plan     # <-- Pass the SIP plan
    )

# --- ASSUMED TEST BLOCK (Updated to check new structure) ---
if __name__ == "__main__":
    
    print("--- [Person 1] Testing Upgraded Portfolio Logic (v_SIP) ---")
    
    test_request = PortfolioRequest(
        capital=100000,
        monthly_investment=10000,
        preferred_tools=["stocks", "mutual funds", "gold"],
        risk_appetite="medium"
    )
    
    try:
        full_portfolio = generate_portfolio(test_request)
        
        print("\n--- Generated Full Portfolio (as JSON) ---")
        print(full_portfolio.model_dump_json(indent=2))
        
        print(f"\n--- Lump Sum Total: ₹{sum([a.amount for a in full_portfolio.lump_sum_allocation]):,} ---")
        print(f"--- SIP Total: ₹{sum([a.amount for a in full_portfolio.monthly_sip_allocation]):,}/month ---")
        
    except Exception as e:
        print(f"Test failed: {e}")