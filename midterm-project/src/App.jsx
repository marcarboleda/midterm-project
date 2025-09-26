import React, { useEffect } from 'react';
import { useGame } from './contexts/GameContext';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';

const getImageUrl = (filename) => {
  if (!filename) return null;
  try {
    // It looks inside src/ for assets/images/
    return new URL(`./assets/images/${filename}`, import.meta.url).href;
  } catch (error) {
    console.error(`Error finding image: ${filename}. Make sure it exists in src/assets/images/`);
    return null;
  }
};

function App() {
  const { gameStarted, isGameOver, isVictory, storyNode, isTransitioning, isFlashing, player, isShaking } = useGame();

  const isGameActive = gameStarted && !isGameOver && !isVictory;
  const appLayoutClassName = isGameActive ? 'in-game-layout' : 'center-layout';
  const transitionClassName = isTransitioning ? 'saturate-out' : '';
  const shakeClassName = isShaking ? 'screen-shake' : '';
  const vignetteOpacity = gameStarted ? 1 - (player.hp / 100) : 0;

  useEffect(() => {
    let filename = '';
    
    if (!gameStarted) {
      filename = 'start-screen-bg.png'; 
    } else if (storyNode) {
      filename = storyNode.background;
    }

    // This ensures we only try to change the background if a new one is actually defined.
    if (filename) {
      const imageUrl = getImageUrl(filename);

      if (imageUrl) {
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundColor = '#0a0a0a';
      } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '#1a1a22';
      }
    }

  }, [gameStarted, storyNode]);

  const renderContent = () => {
    if (isGameOver || isVictory) { return <EndScreen />; }
    if (gameStarted) { return <GameScreen />; }
    return <StartScreen />;
  };

  return (
    <main className={`app ${appLayoutClassName} ${transitionClassName} ${shakeClassName}`}>
      <div className={`flash-overlay ${isFlashing ? 'active' : ''}`}></div>
      <div className="vignette-overlay" style={{ opacity: vignetteOpacity }}></div>
      {renderContent()}
    </main>
  );
}

export default App;