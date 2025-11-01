import React, { useState } from 'react';
import AllocationPieChart from './AllocationPieChart';
import styled from '@emotion/styled';
import { theme } from '../theme'; // Assuming your theme file

// --- Styled Components ---

const PortfolioContainer = styled.div`
  width: 100%;
  margin: 10px auto;
  background: ${theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
`;

const TabButtons = styled.div`
  display: flex;
  background: #2d3748; // A slightly lighter dark bg for tabs
`;

const TabButton = styled.button`
  flex: 1;
  padding: 14px 10px;
  border: none;
  background: ${({ isActive }) => (isActive ? theme.colors.surface : 'transparent')};
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: ${({ isActive }) => (isActive ? theme.colors.primary : theme.colors.textSecondary)};
  transition: all 0.3s ease;
  border-bottom: 3px solid ${({ isActive }) => (isActive ? theme.colors.primary : 'transparent')};

  &:hover {
    background: ${theme.colors.surface};
  }
`;

const TabContent = styled.div`
  padding: 20px;
`;

const PlanTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const ChartContainer = styled.div`
  height: 250px;
  margin-bottom: 25px;
`;

const AllocationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const AllocationItem = styled.li`
  background: #1f2937; // Darker item background
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
`;

const ItemAsset = styled.span`
  color: ${theme.colors.text};
`;

const ItemAmount = styled.span`
  color: #34d399; // Green for amount
  font-family: monospace;
`;

const ItemRecs = styled.div`
  margin-top: 12px;
  padding-left: 15px;
  border-left: 2px solid ${theme.colors.primary};
`;

const ItemRecsTitle = styled.h5`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

const ItemRecsText = styled.p`
  margin: 0 0 5px 0;
  font-size: 13px;
  color: ${theme.colors.text};
  line-height: 1.4;
`;

// Helper to format currency
const formatCurrency = (num) => `₹${num.toLocaleString('en-IN')}`;

// --- The React Component ---

export default function PortfolioDisplay({ portfolioData }) {
  // portfolioData is the full PortfolioResponse object
  // It comes from `msg.data` in your ChatInterface
  const { 
    lump_sum_allocation, 
    monthly_sip_allocation 
  } = portfolioData;

  const [activeTab, setActiveTab] = useState('lump_sum');

  // Check if we have a valid SIP plan to show
  const hasSipPlan = monthly_sip_allocation && monthly_sip_allocation.length > 0;

  // Determine which data to show
  const isLumpSum = activeTab === 'lump_sum';
  const dataToShow = isLumpSum ? lump_sum_allocation : monthly_sip_allocation;
  const title = isLumpSum ? 'Lump Sum Investment Plan' : 'Monthly SIP Plan';
  const currencySuffix = isLumpSum ? '' : '/month';

  return (
    <PortfolioContainer>
      <TabButtons>
        <TabButton
          isActive={isLumpSum}
          onClick={() => setActiveTab('lump_sum')}
        >
          Lump Sum Plan
        </TabButton>
        {hasSipPlan && (
          <TabButton
            isActive={!isLumpSum}
            onClick={() => setActiveTab('monthly_sip')}
          >
            Monthly SIP Plan
          </TabButton>
        )}
      </TabButtons>

      <TabContent>
        <PlanTitle>{title}</PlanTitle>
        
        <ChartContainer>
          <AllocationPieChart allocationData={dataToShow} />
        </ChartContainer>
        
        <AllocationList>
          {dataToShow.map((item) => (
            <AllocationItem key={item.asset_class}>
              <ItemHeader>
                <ItemAsset>{item.asset_class} ({(item.percentage * 100).toFixed(0)}%)</ItemAsset>
                <ItemAmount>
                  {formatCurrency(item.amount)}{currencySuffix}
                </ItemAmount>
              </ItemHeader>
              <ItemRecs>
                <ItemRecsTitle>Top Recommendations:</ItemRecsTitle>
                {item.recommendations.map(rec => (
                  <ItemRecsText key={rec.name}>
                    <strong>{rec.name}:</strong> {rec.details}
                  </ItemRecsText>
                ))}
              </ItemRecs>
            </AllocationItem>
          ))}
        </AllocationList>
      </TabContent>
    </PortfolioContainer>
  );
}