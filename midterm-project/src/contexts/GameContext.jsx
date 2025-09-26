import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import storyData from '../data/story.json';
import { audioManager } from '../utils/AudioManager';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const initialPlayerState = {
    name: '',
    hp: 100,
    inventory: ['bolo'],
};

const applyOnArriveEffects = (effects, currentPlayerState) => {
    if (!effects) return { newPlayerState: currentPlayerState, damageTaken: 0 };
    
    let newPlayerState = { ...currentPlayerState };
    let damageTaken = 0;

    // 1. Handle Damage
    if (effects.takeDamage) {
        damageTaken = effects.takeDamage;
        newPlayerState.hp = Math.max(0, newPlayerState.hp - damageTaken);
    }

    // 2. Handle Item Addition
    if (effects.addItem && !newPlayerState.inventory.includes(effects.addItem)) {
        newPlayerState.inventory = [...newPlayerState.inventory, effects.addItem];
    }
    
    // 3. Handle Item Removal (Consumption)
    if (effects.removeItem) {
        newPlayerState.inventory = newPlayerState.inventory.filter(
            (item) => item !== effects.removeItem
        );
    }

    return { newPlayerState, damageTaken };
};

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(() => {
        const savedStateJSON = localStorage.getItem('aswangHunterGameState');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (storyData[savedState.currentStoryId]) {
                return savedState;
            }
            console.warn("Saved story ID not found. Resetting game.");
        }
        return {
            player: initialPlayerState,
            currentStoryId: 'start',
            gameStarted: false,
            isGameOver: false,
            isVictory: false,
        };
    });

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isDamageFlashing, setIsDamageFlashing] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const currentlyPlayingMusic = useRef(null);

    // Audio Unlock and Music Control Effect
    useEffect(() => {
        const handleMusic = () => {
            const currentNode = storyData[gameState.currentStoryId];
            
            // If the game is ending, stop music
            const shouldStopMusic = !currentNode || gameState.isGameOver || gameState.isVictory;
            
            if (shouldStopMusic) {
                audioManager.stop('music');
                currentlyPlayingMusic.current = null;
                return;
            }
            
            const desiredTrack = 'music'; // Only 'music' is in use here

            if (currentlyPlayingMusic.current !== desiredTrack) {
                const oldTrack = currentlyPlayingMusic.current;
                if (oldTrack) {
                    audioManager.stop(oldTrack);
                }
                audioManager.play(desiredTrack);
                currentlyPlayingMusic.current = desiredTrack;
            }
        };

        if (audioUnlocked) {
            handleMusic();
        } else {
            const unlockListener = () => {
                setAudioUnlocked(true);
                window.removeEventListener('click', unlockListener);
                window.removeEventListener('keydown', unlockListener);
            };
            window.addEventListener('click', unlockListener);
            window.addEventListener('keydown', unlockListener);

            return () => {
                window.removeEventListener('click', unlockListener);
                window.removeEventListener('keydown', unlockListener);
            };
        }
    }, [gameState.currentStoryId, gameState.isGameOver, gameState.isVictory, audioUnlocked]);


    // --- Handles Game Over/Victory Audio ---
    useEffect(() => {
        if (gameState.isGameOver) {
            audioManager.stop('music');
            audioManager.play('gameOver'); 
        } 
        
        if (gameState.isVictory) {
             audioManager.stop('music');
             audioManager.play('victory'); // <-- Plays the Victory Sound
        }
    }, [gameState.isGameOver, gameState.isVictory]);


    // HP-based Game Over Effect (This is what sets isGameOver to true)
    useEffect(() => {
        if (gameState.player.hp <= 0 && gameState.currentStoryId !== 'gameOver_hp' && !gameState.isGameOver) {
            setGameState(prev => ({ 
                ...prev, 
                currentStoryId: 'gameOver_hp', 
                isGameOver: true, 
                isVictory: false 
            }));
        }
    }, [gameState.player.hp, gameState.currentStoryId, gameState.isGameOver]);

    // Save Game State to LocalStorage
    useEffect(() => {
        localStorage.setItem('aswangHunterGameState', JSON.stringify(gameState));
    }, [gameState]);

    const startGame = (playerName) => {
        // Play click sound on start to confirm audio unlock
        audioManager.play('choice'); 
        
        setGameState(prev => ({ 
            ...prev, 
            player: { ...initialPlayerState, name: playerName }, 
            gameStarted: true 
        }));
    };

    const makeChoice = useCallback((choice) => {
        if (isTransitioning) return;
        
        // Play click sound when a choice is made
        audioManager.play('choice'); 

        const nextId = choice.to;
        const nextNode = storyData[nextId];
        
        setIsTransitioning(true);

        const { newPlayerState, damageTaken } = applyOnArriveEffects(nextNode.onArrive, gameState.player);
        
        if (damageTaken > 0) {
            // Damage audio and visual effects should fire IMMEDIATELY (not in the timeout)
            audioManager.play('damage');
            setIsShaking(true);
            setIsDamageFlashing(true);
            
            // Set timeouts to end the visual effects
            setTimeout(() => setIsShaking(false), 400);
            setTimeout(() => setIsDamageFlashing(false), 200);
        }

        setTimeout(() => {
            setGameState(prev => {
                // Check if the current choice is an end node
                const isEndingNode = nextNode.isEnding || false;
                const isVictory = isEndingNode && nextId.toLowerCase().includes('good');
                
                // Check for Game Over via ending node OR HP loss (using newPlayerState.hp)
                const isGameOver = (isEndingNode && !isVictory) || newPlayerState.hp <= 0;
                
                // Determine final ID, prioritizing 'gameOver_hp' if HP dropped to 0
                const finalNextId = newPlayerState.hp <= 0 ? 'gameOver_hp' : nextId;

                return { 
                    ...prev, 
                    player: newPlayerState, 
                    currentStoryId: finalNextId, 
                    isGameOver, 
                    isVictory 
                };
            });
            setIsTransitioning(false);
        }, 1000);
    }, [isTransitioning, gameState.player]); 

    const restartGame = () => {
        audioManager.startAmbientMusic();
        localStorage.removeItem('aswangHunterGameState');
        setGameState({ 
            player: initialPlayerState, 
            currentStoryId: 'start', 
            gameStarted: false, 
            isGameOver: false, 
            isVictory: false 
        });
    };

    const value = {
        ...gameState,
        storyNode: storyData[gameState.currentStoryId],
        isTransitioning,
        isDamageFlashing,
        isShaking,
        startGame,
        makeChoice,
        restartGame,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};