from pydantic import BaseModel, Field
from typing import List, Literal

# --- ASSUMED EXISTING MODELS ---
# (I am including these so the file is complete)

class PortfolioRequest(BaseModel):
    capital: int = Field(..., gt=0, description="Total capital amount to invest (e.g., 100000)")
    monthly_investment: int = Field(..., ge=0, description="Additional monthly investment (e.g., 5000)")
    preferred_tools: List[str] = Field(..., description="List of preferred tools (e.g., ['stocks', 'gold'])")
    risk_appetite: Literal["low", "medium", "high"] = Field(..., description="User's risk tolerance")

class Recommendation(BaseModel):
    name: str
    details: str

# --- TASK 1: NEW & UPGRADED MODELS ---

# 1. NEW Reusable AllocationDetails Model
# This will replace your old 'AssetAllocation'
class AllocationDetails(BaseModel):
    asset_class: str = Field(..., description="e.g., 'Direct Equity', 'Gold'")
    amount: int = Field(..., description="Calculated amount in INR for this asset")
    percentage: float = Field(..., description="Percentage of the total (e.g., 0.4 for 40%)")
    recommendations: List[Recommendation] = Field(..., description="List of specific investment recommendations")

# 2. UPGRADED PortfolioResponse Model
class PortfolioResponse(BaseModel):
    risk_profile: str
    projected_return_estimate: str
    
    # REMOVED old 'allocation' field
    # ADDED two new fields:
    lump_sum_allocation: List[AllocationDetails]
    monthly_sip_allocation: List[AllocationDetails]