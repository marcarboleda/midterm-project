import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';

function StartScreen() {
  const [name, setName] = useState('');
  const { startGame } = useGame();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      startGame(name.trim());
    }
  };

  return (
    <div className="start-screen-container">
      <h1 className="game-title">Aswang Hunter</h1>
      {/* UPDATED DESCRIPTION TEXT */}
      <p className="game-subtitle">Uncover the darkest secrets of Philippine folklore in this gripping text-based RPG.</p> 
      <form onSubmit={handleSubmit} className="start-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          maxLength="15"
        />
        <button type="submit">Start the Hunt</button>
      </form>
    </div>
  );
}

export default StartScreen;