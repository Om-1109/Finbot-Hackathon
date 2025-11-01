import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// --- Styled Components ---

// Base styles copied from ChatInterface BotBubble
const Bubble = styled(motion.div)`
  padding: 0.75rem 1.25rem;
  border-radius: 1.5rem;
  max-width: 75%;
  line-height: 1.6;
  font-size: 0.95rem;
  align-self: flex-start;
  background: ${props => props.theme.colors.botBubble};
  border: 1px solid ${props => props.theme.colors.border};
  border-top-left-radius: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Dot = styled(motion.span)`
  display: block;
  width: 8px;
  height: 8px;
  background-color: ${props => props.theme.colors.textSecondary};
  border-radius: 50%;
`;

// --- Animation Variants ---

// Staggered container for the dots
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.15, // Each dot animates 0.15s after the previous
    },
  },
};

// "Liquid pulse" animation for each dot
const dotVariants = {
  animate: {
    y: [0, -3, 0], // Move up and down
    transition: {
      duration: 0.7,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// --- Component ---

export const TypingIndicator = () => {
  return (
    <Bubble
      layout // Ensures it animates its position
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <motion.div
        style={{ display: 'flex', gap: '0.5rem' }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <Dot variants={dotVariants} />
        <Dot variants={dotVariants} />
        <Dot variants={dotVariants} />
      </motion.div>
    </Bubble>
  );
};
