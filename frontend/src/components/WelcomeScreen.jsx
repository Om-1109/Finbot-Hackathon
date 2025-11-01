import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
// --- Senior Dev Note:
// Fixing the import path. The build tool seems to prefer
// an absolute path from the project root ('/') instead of
// a relative path ('../').
import { theme } from '/src/theme.js';
// ---

// --- Styled Components ---

const WelcomeContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
  background: ${theme.colors.background}; /* Ensure it matches */
`;

const Logo = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  color: ${theme.colors.textHeadline};
  
  span {
    color: ${theme.colors.primary};
  }
`;

const Headline = styled(motion.h2)`
  font-size: 2.75rem;
  font-weight: 600;
  color: ${theme.colors.textHeadline};
  margin-top: 1.5rem;
  max-width: 600px;
  line-height: 1.2;
`;

const SubHeadline = styled(motion.p)`
  font-size: 1.25rem;
  color: ${theme.colors.textSecondary};
  margin-top: 1rem;
  max-width: 550px;
`;

const StartButton = styled(motion.button)`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0D1117; /* Dark background for contrast on button */
  background: ${theme.colors.primary};
  border: none;
  border-radius: 50px; /* Pill shape */
  margin-top: 3rem;
  cursor: pointer;
  letter-spacing: 0.5px;
  
  /* Subtle shadow from our theme */
  box-shadow: ${theme.shadows.small};

  /* We'll use Framer Motion for hover/tap, but good to have a fallback */
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: ${theme.shadows.medium};
  }
`;

// --- Animation Variants ---

// Staggered container for all items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Each child animates 0.2s after the previous
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    }
  }
};

// Fade-in + slide-up variant for each item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    }
  },
};

// --- Component ---

export const WelcomeScreen = ({ onStart }) => {
  return (
    <WelcomeContainer
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit" // This is crucial for AnimatePresence
    >
      <Logo variants={itemVariants}>
        FinBot<span>.</span>
      </Logo>
      <Headline variants={itemVariants}>
        Your Financial Future,
        Digitally Crafted.
      </Headline>
      <SubHeadline variants={itemVariants}>
        Let our AI analyze your goals and build a personalized
        investment plan in seconds.
      </SubHeadline>
      
      <StartButton
        onClick={onStart}
        variants={itemVariants}
        // Subtle pulse animation to draw the eye
        animate={{
          scale: [1, 1.02, 1],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5 // Start after initial animation
          }
        }}
        // Hover/tap animations from Framer Motion
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Your Personalized Plan
      </StartButton>
    </WelcomeContainer>
  );
};

