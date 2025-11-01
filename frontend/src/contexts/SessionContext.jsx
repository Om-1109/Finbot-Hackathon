import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 1. Create the context
const SessionContext = createContext();

// 2. Create the provider component
// This component will generate a single, stable session ID when the app first loads
// and provide it to all children components.
export const SessionProvider = ({ children }) => {
  // We use useState to store the session ID.
  // The function inside useState () => uuidv4() ensures it only runs ONCE.
  const [sessionId] = useState(() => uuidv4());

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

// 3. Create a custom hook for easy access
// This lets any component just call useSession() to get the ID.
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
