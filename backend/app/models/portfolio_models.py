from pydantic import BaseModel, Field
from typing import List, Literal

class PortfolioRequest(BaseModel):
    capital: int = Field(..., gt=0, description="Total capital amount to invest (e.g., 100000)")
    monthly_investment: int = Field(..., ge=0, description="Additional monthly investment (e.g., 5000)")
    preferred_tools: List[str] = Field(..., description="List of preferred tools (e.g., ['stocks', 'mutual funds', 'gold'])")
    risk_appetite: Literal["low", "medium", "high"] = Field(..., description="User's risk tolerance")

class Recommendation(BaseModel):
    name: str
    details: str

class AssetAllocation(BaseModel):
    # This description is updated
    asset_class: str = Field(..., description="e.g., 'Direct Equity', 'Equity Funds', 'Debt Instruments', 'Gold'")
    amount: int = Field(..., description="Calculated amount in INR for this asset class")
    percentage: float = Field(..., description="Percentage of the total portfolio (e.g., 0.6 for 60%)")
    recommendations: List[Recommendation] = Field(..., description="List of specific investment recommendations")

class PortfolioResponse(BaseModel):
    risk_profile: str
    projected_return_estimate: str
    allocation: List[AssetAllocation]