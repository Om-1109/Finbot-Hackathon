import axios from 'axios';

// This is the endpoint Person 2 (backend) is building for you.
// CORRECT
// CORRECT
const API_URL = 'http://localhost:8000/api/chat';

/**
 * Sends a user's message and session ID to the backend.
 * This directly follows your API contract.
 *
 * @param {string} message - The text from the user.
 * @param {string} sessionId - The unique session ID.
 * @returns {Promise<object>} - The backend's response object.
 */
export const postChatMessage = async (message, sessionId) => {
  try {
    // 1. We send exactly what the contract specifies:
    const requestBody = {
      message: message,
      session_id: sessionId,
    };

    // 2. We make the POST request.
    const response = await axios.post(API_URL, requestBody);

    // 3. We return the 'data' part of the response,
    //    which will be the object: { response_type, content, portfolio_data }
    return response.data;

  } catch (error) {
    console.error('Error posting chat message:', error);
    // Return a structured error message so the chat hook can display it.
    return {
      response_type: 'text',
      content: `Sorry, I ran into an error. ${error.message || 'Could not connect to backend.'}`,
      portfolio_data: null,
    };
  }
};