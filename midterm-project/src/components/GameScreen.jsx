import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTypewriter } from '../hooks/useTypewriter';
import PlayerStats from './PlayerStats';

function GameScreen() {
    const { 
        storyNode, 
        makeChoice, 
        player, 
        isTransitioning, 
        isGameOver,      
        isVictory,       
        restartGame      
    } = useGame();
    
    const { displayedText, isFinishedTyping, skipTyping } = useTypewriter(storyNode.text, 30);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter' && !isFinishedTyping) {
                skipTyping();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isFinishedTyping, skipTyping]);


    // Handle Game Over / Victory Screen
    if (isGameOver || isVictory) {
        const containerClass = isVictory ? 'victory' : 'game-over';
        const titleText = isVictory ? 'VICTORY' : 'GAME OVER';

        return (
            <div className="end-screen-overlay">
                <div className={`end-screen-container ${containerClass}`}>
                    <h1>{titleText}</h1>
                    <p className="story-text">{storyNode.text}</p>
                    <button onClick={restartGame}>
                        Begin the Hunt Anew
                    </button>
                </div>
            </div>
        );
    }
    
    // Handle Regular Game Screen
    const containerClassName = isTransitioning ? 'fade-out' : 'fade-in';

    return (
        <div className="game-screen-wrapper">
            <PlayerStats />

            <div className={`game-container ${containerClassName}`}>
                <div className="story-text-container">
                    <p className="story-text">{displayedText}</p>
                </div>
                
                {isFinishedTyping && (
                    <div className="choices-panel">
                        {storyNode.choices?.map((choice, index) => {
                            const hasRequiredItem = choice.requires ? player.inventory.includes(choice.requires) : true;
                            const shouldHide = choice.hideIf ? player.inventory.includes(choice.hideIf) : false;
                            
                            // Only display the choice if it's not hidden AND the player has the required item.
                            if (!shouldHide && hasRequiredItem) { 
                                return (
                                    <button 
                                        key={index} 
                                        onClick={() => makeChoice(choice)}
                                    >
                                        {choice.text}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
                
                {!isFinishedTyping && (
                    <button className="skip-button" onClick={skipTyping}>
                        Skip »
                    </button>
                )}
            </div>
        </div>
    );
}

export default GameScreen;