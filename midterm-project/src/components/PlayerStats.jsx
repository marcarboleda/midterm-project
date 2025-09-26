import React from 'react';
import { useGame } from '../contexts/GameContext';
import { itemData } from '../data/itemData';

function PlayerStats() {
  const { player } = useGame();
  const hpPercentage = player.hp > 0 ? player.hp : 0;
  const isLowHP = player.hp <= 30; // 30% or less is 'danger'

  return (
    <div className="player-hud">
      <div className={`stats-container ${isLowHP ? 'danger-pulse' : ''}`}>
        <div className="player-name">{player.name || 'Hunter'}</div>
        <div className="hp-bar-container">
          <div className="hp-bar-fill" style={{ width: `${hpPercentage}%` }}></div>
          <span className="hp-bar-text">{player.hp} / 100</span>
        </div>
      </div>
      <div className="inventory-container">
        <div className="inventory-title">Inventory</div>
        <ul className="inventory-list">
          {player.inventory.length > 0 ? (
            player.inventory.map(itemId => {
              const item = itemData[itemId];
              if (!item) return null;
              return (
                <li key={itemId} className="inventory-list-item">
                  <div className="item-icon-container">
                    <img src={item.icon} alt={item.name} />
                  </div>
                  <span className="item-name">{item.name}</span>
                </li>
              );
            })
          ) : (
            <li className="inventory-empty-slot">Empty</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default PlayerStats;