import json
import random
from pathlib import Path
from typing import List, Dict, Any

from app.models.portfolio_models import (
    PortfolioRequest,
    PortfolioResponse,
    AssetAllocation,
    Recommendation
)

# --- 1. SETUP: Updated Data Cache ---
# FIX: _file_ (double underscore)
DATA_DIR = Path(__file__).parent.parent/"data"

# Updated file paths
EQUITY_STOCKS_FILE = DATA_DIR / "direct_equity.json"
EQUITY_FUNDS_FILE = DATA_DIR / "equity_funds.json"
DEBT_FILE = DATA_DIR / "debt_instruments.json"
GOLD_FILE = DATA_DIR / "gold_instruments.json"

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

# Load all new databases
STOCKS_DB = _load_json_data(EQUITY_STOCKS_FILE)
EQUITY_FUNDS_DB = _load_json_data(EQUITY_FUNDS_FILE)
DEBT_DB = _load_json_data(DEBT_FILE)
GOLD_DB = _load_json_data(GOLD_FILE)

# Updated Map: Connects our new logic to our new files
ASSET_CLASS_TO_DB = {
    "Direct Equity": STOCKS_DB,
    "Equity Funds": EQUITY_FUNDS_DB,
    "Debt Instruments": DEBT_DB,
    "Gold": GOLD_DB,
}

# --- 2. CORE FUNCTION: The "Engine" (Upgraded Logic) ---

def generate_portfolio(request: PortfolioRequest) -> PortfolioResponse:
    """
    Generates a personalized investment portfolio based on Asset Classes.
    This is the upgraded v2 logic.
    """
    
    # 1. Define NEW allocation rules based on asset classes
    if request.risk_appetite == 'low':
        allocation_rules = {"Debt Instruments": 0.7, "Gold": 0.2, "Equity Funds": 0.1}
        projected_return = "6-8% p.a."
    
    elif request.risk_appetite == 'medium':
        # Split between direct stocks and funds for equity
        allocation_rules = {"Equity Funds": 0.4, "Debt Instruments": 0.4, "Direct Equity": 0.1, "Gold": 0.1}
        projected_return = "9-12% p.a."
    
    elif request.risk_appetite == 'high':
        # More aggressive equity split
        allocation_rules = {"Direct Equity": 0.4, "Equity Funds": 0.3, "Debt Instruments": 0.2, "Gold": 0.1}
        projected_return = "12-15% p.a."
    
    else:
        # This is a safe fallback
        print(f"Warning: Invalid risk_appetite '{request.risk_appetite}', defaulting to medium.")
        allocation_rules = {"Equity Funds": 0.4, "Debt Instruments": 0.4, "Direct Equity": 0.1, "Gold": 0.1}
        projected_return = "9-12% p.a."

    final_allocations: List[AssetAllocation] = []

    # 2. Iterate through the new rules and build the portfolio
    for asset_class, percentage in allocation_rules.items():
        
        amount_to_allocate = int(request.capital * percentage)
        
        # Get the correct database for this asset class
        # (e.g., "Direct Equity" -> STOCKS_DB)
        source_db = ASSET_CLASS_TO_DB.get(asset_class, [])
        
        num_to_pick = 0
        if source_db: # Only sample if the DB is not empty
             num_to_pick = min(len(source_db), 2) # Pick 2 recommendations
        
        recommendations_list: List[Recommendation] = []
        if num_to_pick > 0:
            picked_items = random.sample(source_db, num_to_pick)
            recommendations_list = [
                Recommendation(
                    name=item.get('name', 'N/A'),
                    details=item.get('details', item.get('category', 'No details available.'))
                ) for item in picked_items
            ]
        
        asset_allocation = AssetAllocation(
            asset_class=asset_class, # This will now be "Direct Equity", "Gold", etc.
            amount=amount_to_allocate,
            percentage=percentage,
            recommendations=recommendations_list
        )
        
        final_allocations.append(asset_allocation)

    # 3. Build and return the final response object
    return PortfolioResponse(
        risk_profile=request.risk_appetite,
        projected_return_estimate=projected_return,
        allocation=final_allocations
    )

# --- 4. INDEPENDENT TEST BLOCK (No changes needed) ---
# FIX: _name_ (double underscore)
if __name__ == "__main__":
    
    print("--- [Person 3] Testing Portfolio Generation Logic (v2) ---")
    
    # 1. Test Case: "Medium" Risk
    print("\n--- Testing: Medium Risk Portfolio ---")
    medium_risk_request = PortfolioRequest(
        capital=100000,
        monthly_investment=5000,
        preferred_tools=["stocks", "mutual funds", "gold"],
        risk_appetite="medium"
    )
    
    try:
        medium_portfolio = generate_portfolio(medium_risk_request)
        print(medium_portfolio.model_dump_json(indent=2))
        
    except Exception as e:
        print(f"Medium risk test failed: {e}")

    # 2. Test Case: "High" Risk
    print("\n--- Testing: High Risk Portfolio ---")
    high_risk_request = PortfolioRequest(
        capital=500000,
        monthly_investment=25000,
        preferred_tools=["stocks"],
        risk_appetite="high"
    )
    
    try:
        high_portfolio = generate_portfolio(high_risk_request)
        print(high_portfolio.model_dump_json(indent=2))
    except Exception as e:
        print(f"High risk test failed: {e}")