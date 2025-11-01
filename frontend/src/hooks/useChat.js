import { useState } from 'react';
// We import the custom hook we made, not the context itself.
import { useSession } from '@/contexts/SessionContext.jsx'; 
import { postChatMessage } from '@/services/api.js';

/**
 * This is the "brain" of our chat.
 * It manages the message list, loading state,
 * and handles all API communication.
 */
export const useChat = () => {
  // Use our custom hook to get the session ID
  const { sessionId } = useSession(); 

  const [messages, setMessages] = useState([
    // Start with the default bot greeting
    {
      from: 'bot',
      type: 'text',
      text: "Hello! I'm FinBot, your AI financial advisor. Let's start building your portfolio. What's your total capital for investment?",
      data: null,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // This is the function our <ChatInput> will call
  const sendMessage = async (userMessage) => {
    // 1. Add the user's message to the state immediately
    const userMsg = {
      from: 'user',
      type: 'text',
      text: userMessage,
      data: null
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Set loading state to true (for the spinner and typing indicator)
    setIsLoading(true);

    try {
      // 3. Call the backend API (Person 2's world)
      const res = await postChatMessage(userMessage, sessionId);

      // 4. Create the bot's response message from the API data
      const botMsg = {
        from: 'bot',
        type: res.response_type, // 'text' or 'portfolio'
        text: res.content,
        data: res.portfolio_data // null or { ... }
      };

      // 5. Add the bot's response to the state
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      // Handle any API errors gracefully
      console.error("Failed to send message:", error);
      const errorMsg = {
        from: 'bot',
        type: 'text',
        text: "Sorry, I'm having trouble connecting to my servers. Please try again in a moment.",
        data: null
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      // 6. ALWAYS set loading back to false
      setIsLoading(false);
    }
  };

  // Return everything the UI needs
  return { messages, isLoading, sendMessage };
};

