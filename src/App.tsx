import React from 'react';
import { PathGameScreen } from '@/components/PathGame/PathGameScreen';

/**
 * Main App Component
 * 
 * Now using the new 6-path success story system.
 * The old GameProvider/GameContext is preserved for backward compatibility
 * but the main game flow uses PathGameScreen.
 */
const App: React.FC = () => {
    return <PathGameScreen />;
};

export default App;
