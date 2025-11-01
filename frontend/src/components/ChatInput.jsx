import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme'; // Import theme for styling

// --- Styled Components (Phase 4 Upgrade) ---

const InputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  /* Add a subtle border top */
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
`;

const StyledInput = styled.input`
  flex: 1;
  font-size: 1rem;
  padding: 0.85rem 1.25rem;
  border-radius: 50px; /* Pill shape */
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.botBubble};
  color: ${theme.colors.text};
  outline: none;
  
  /* The "intelligent focus" animation */
  transition: all 0.2s ease-in-out;
  
  &::placeholder {
    color: ${theme.colors.textSecondary};
  }

  &:focus {
    background: ${theme.colors.surface};
    border-color: ${theme.colors.primary};
    /* Subtle glow */
    box-shadow: 0 0 0 3px ${theme.colors.primary}33;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SendButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px; /* Fixed size */
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${theme.colors.primary};
  color: ${theme.colors.background};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// --- SVG Icons (as components) ---

const SendIcon = () => (
  <motion.svg
    key="send"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="22"
    height="22"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    style={{ marginLeft: '2px' }} // Optically center
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </motion.svg>
);

const LoadingSpinner = () => (
  <motion.div
    key="spinner"
    style={{
      width: '22px',
      height: '22px',
      border: `3px solid ${theme.colors.background}80`,
      borderTopColor: theme.colors.background,
      borderRadius: '50%',
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      rotate: 360,
    }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{
      rotate: { repeat: Infinity, duration: 0.8, ease: 'linear' },
      default: { type: 'spring', stiffness: 400, damping: 20 }
    }}
  />
);


// --- Component ---

export const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <InputForm onSubmit={handleSubmit}>
      <StyledInput
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isLoading ? "FinBot is thinking..." : "Ask about your portfolio..."}
        disabled={isLoading}
      />
      <SendButton
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
      >
        {/*
          This is the "magic" for the button animation.
          'AnimatePresence' detects when the child (Icon or Spinner)
          is added/removed and runs its 'exit' animation.
          'mode="popLayout"' helps make the transition smoother.
        */}
        <AnimatePresence mode="popLayout">
          {isLoading ? <LoadingSpinner /> : <SendIcon />}
        </AnimatePresence>
      </SendButton>
    </InputForm>
  );
};

