import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

// Reverting to relative paths to fix build errors
// --- Attempt 3: Relative paths WITHOUT extensions ---
import { useChat } from '../hooks/useChat'; 
import { theme } from '../theme'; 
import { ChatInput } from './ChatInput'; 
import { TypingIndicator } from './TypingIndicator'; 
import PortfolioDisplay from './PortfolioDisplay'; 

// --- Styled Components ---

const ChatContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${theme.colors.background};
  overflow: hidden; // Prevents scrollbars on the container itself
`;

// NEW: Header with Back Button
const ChatHeader = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0; // Prevents header from shrinking
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 196, 255, 0.1);
  }
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;
// END NEW

const MessagesContainer = styled.div`
  flex-grow: 1; // Takes up all available space
  overflow-y: auto; // Enables scrolling for messages
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  // Custom scrollbar (from our App.css logic, but good to ensure it)
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #1f2937; 
  }
  &::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
`;

const MessageBubble = styled(motion.div)`
  padding: 0.75rem 1.25rem;
  border-radius: 18px;
  max-width: 75%;
  font-size: 1rem;
  line-height: 1.5;
  word-wrap: break-word; // Ensures long text breaks
`;

// User's message bubble
const UserBubble = styled(MessageBubble)`
  align-self: flex-end;
  background-color: ${theme.colors.primary};
  color: #0D1117; // Dark text on primary bg
  border-bottom-right-radius: 4px;
`;

// Bot's message bubble
const BotBubble = styled(MessageBubble)`
  align-self: flex-start;
  background-color: ${theme.colors.surface};
  color: ${theme.colors.text};
  border-bottom-left-radius: 4px;
`;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const messageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
};

// --- Component ---

// We now accept 'onGoBack' as a prop
export const ChatInterface = ({ onGoBack }) => {
  const { messages, isLoading, sendMessage } = useChat();
  
  // Ref for auto-scrolling
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]); // Also scroll when typing indicator appears

  return (
    <ChatContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* NEW: Added Header */}
      <ChatHeader>
        <BackButton onClick={onGoBack}>&larr;</BackButton>
        <HeaderTitle>FinBot AI Advisor</HeaderTitle>
      </ChatHeader>

      <MessagesContainer ref={scrollRef}>
        {/*
          AnimatePresence is used here for the *message bubbles*
          to pop in as they are added to the list.
        */}
        <AnimatePresence>
          {messages.map((msg, index) => {
            // Check if it's a 'portfolio' type
            if (msg.type === 'portfolio') {
              return (
                <PortfolioDisplay 
                  key={index} // Use index as key
                  text={msg.text} 
                  data={msg.data} 
                />
              );
            }
            
            // Otherwise, it's a text bubble
            const isUser = msg.from === 'user';
            const BubbleComponent = isUser ? UserBubble : BotBubble;

            return (
              <BubbleComponent
                key={index} // Use index as key
                variants={messageVariants}
                initial="hidden"
                animate="visible"
              >
                {msg.text}
              </BubbleComponent>
            );
          })}

          {/* Show the typing indicator if isLoading is true */}
          {isLoading && <TypingIndicator key="typing" />}
        </AnimatePresence>
      </MessagesContainer>

      {/* The Chat Input bar at the bottom */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </ChatContainer>
  );
};


