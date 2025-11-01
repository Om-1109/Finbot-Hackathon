import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';
import { AllocationPieChart } from './AllocationPieChart'; // Import our new chart

// --- Styled Components (Phase 5 Upgrade) ---

const PortfolioContainer = styled(motion.div)`
  width: 100%;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${theme.colors.botBubble};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.textHeadline};
  text-align: center;
  margin-bottom: 1.5rem;
`;

const SummaryCardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Use motion.div to get hover animations
const SummaryCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  
  h4 {
    margin: 0;
    font-size: 0.9rem;
    color: ${theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.accent ? theme.colors.primary : theme.colors.text};
  }
`;

const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const AccordionHeader = styled(motion.button)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textHeadline};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  
  span:last-of-type {
    font-weight: 400;
    color: ${theme.colors.textSecondary};
  }
`;

const AccordionContent = styled(motion.div)`
  overflow: hidden; // Critical for height animation
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 0.5rem;
`;

// The individual stock/fund cards
const RecommendationCard = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${theme.colors.botBubble};
  border: 1px solid ${theme.colors.border};
  
  div {
    h5 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: ${theme.colors.text};
    }
    p {
      margin: 0;
      font-size: 0.9rem;
      color: ${theme.colors.textSecondary};
    }
  }
  
  span {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${theme.colors.primary};
  }
`;

// --- Component ---

export const PortfolioDisplay = ({ text, data }) => {
  // State to manage which accordion is open
  const [openAccordion, setOpenAccordion] = useState(data.allocation[0].type);

  // Card hover animation from your prompt
  const cardHover = {
    y: -5,
    boxShadow: theme.shadows.medium,
  };

  return (
    <PortfolioContainer
      // Entrance animation
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Title>{text}</Title>
      
      {/* --- Summary Cards --- */}
      <SummaryCardContainer>
        <SummaryCard whileHover={cardHover} accent>
          <h4>Return Est.</h4>
          <p>{data.projected_return_estimate}</p>
        </SummaryCard>
        <SummaryCard whileHover={cardHover}>
          <h4>Risk Profile</h4>
          <p>{data.risk_profile}</p>
        </SummaryCard>
      </SummaryCardContainer>
      
      {/* --- Allocation Chart --- */}
      <AllocationPieChart 
        allocationData={data.allocation} 
        projectedReturn={data.projected_return_estimate}
      />
      
      {/* --- Detailed Breakdown Accordion --- */}
      <AccordionContainer>
        {data.allocation.map((item) => {
          const isOpen = openAccordion === item.type;
          return (
            <div key={item.type}>
              <AccordionHeader
                onClick={() => setOpenAccordion(isOpen ? null : item.type)}
              >
                <span>{item.type}</span>
                <span>{item.percentage}%</span>
              </AccordionHeader>
              
              <AnimatePresence>
                {isOpen && (
                  <AccordionContent
                    // Smooth expand/collapse animation
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {item.recommendations.map((rec) => (
                      <RecommendationCard
                        key={rec.symbol}
                        whileHover={{ 
                          ...cardHover, 
                          borderColor: theme.colors.primary 
                        }}
                      >
                        <div>
                          <h5>{rec.name} ({rec.symbol})</h5>
                          <p>{rec.description}</p>
                        </div>
                        <span>{rec.weight}%</span>
                      </RecommendationCard>
                    ))}
                  </AccordionContent>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </AccordionContainer>
    </PortfolioContainer>
  );
};

