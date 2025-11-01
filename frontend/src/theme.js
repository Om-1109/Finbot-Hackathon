/**
 * Neo-Fintech Dark Mode Theme
 * * This is the central source of truth for all our styling.
 * We'll import this into any component that needs styled.
 */
export const theme = {
  colors: {
    background: '#0D1117',  // Deep Space Blue/Charcoal
    surface: '#161B22',      // Subtly lighter dark blue/gray
    primary: '#00E676',      // Modern Emerald Green (Accent)
    // primary: '#00C4FF',   // Alternative: Fintech Blue
    
    text: '#E6EDF3',          // Light Gray (Body)
    textHeadline: '#FFFFFF',  // Bright White (Headlines)
    textSecondary: '#8B949E', // For subtitles, placeholders
    
    border: '#30363D',       // For subtle borders and dividers
    
    // Message bubble colors
    userBubble: '#1A212A',
    botBubble: '#161B22',
  },
  fonts: {
    primary: "'Poppins', 'Inter', sans-serif",
  },
  shadows: {
    // For "lift" effects
    small: '0 4px 12px rgba(0, 230, 118, 0.1)', 
    medium: '0 6px 20px rgba(0, 230, 118, 0.15)',
  }
};
