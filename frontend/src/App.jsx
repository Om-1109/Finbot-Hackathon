import React, { useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';

// --- Our "Scene" Components ---
// Reverting from '@' alias back to standard relative paths.
// This is the correct relative path from /src/App.jsx to /src/components/
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { ChatInterface } from './components/ChatInterface.jsx';

// --- Styled Components ---

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${props => props.theme.colors.background};
`;

// --- Component ---

function App() {
  // This state is our "Scene Manager"
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <AppContainer>
      <AnimatePresence mode="wait">
        {
          !hasStarted
            // SCENE 1: WELCOME
            ? (
              <WelcomeScreen 
                key="welcome" 
                onStart={() => setHasStarted(true)} 
              />
            )
            // SCENE 2: CHAT
            : (
              <ChatInterface 
                key="chat" 
                // We now pass the function to go back to the welcome screen
                onGoBack={() => setHasStarted(false)}
              />
            )
        }
      </AnimatePresence>
    </AppContainer>
  );
}

export default App;


