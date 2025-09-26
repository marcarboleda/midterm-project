import React from 'react';
import { useGame } from '../contexts/GameContext';

function EndScreen() {
  const { isVictory, storyNode, restartGame } = useGame();

  // Determine the class based on victory or game over
  const screenClass = isVictory ? 'victory' : 'game-over';

  return (
    <div className={`end-screen-container ${screenClass}`}> {/* Apply dynamic class */}
      <h1>{isVictory ? 'Victory!' : 'Game Over'}</h1>
      <p className="story-text">{storyNode.text}</p>
      <button onClick={restartGame}>Play Again</button>
    </div>
  );
}

export default EndScreen;