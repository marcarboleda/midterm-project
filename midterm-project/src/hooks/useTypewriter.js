import { useState, useEffect, useCallback, useRef } from 'react';
import { audioManager } from '../utils/AudioManager'; // Make sure this path is correct

export const useTypewriter = (text, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinishedTyping, setIsFinishedTyping] = useState(false);
  
  const intervalRef = useRef(null);
  // Stops the typing effect interval.
  const stopTyping = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setDisplayedText('');
    setIsFinishedTyping(false);
    stopTyping(); // Stop any previous timer
    
    if (!text) {
      setIsFinishedTyping(true);
      return;
    }

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        // Play typing sound for each character that isn't a space
        if (text.charAt(i) !== ' ') {
            audioManager.play('type');
        }
        i++;
      } else {
        stopTyping(); // Stop the interval when finished
        setIsFinishedTyping(true);
      }
    }, speed);

    // The cleanup function ensures the timer is stopped if the component unmounts
    return () => stopTyping();
  }, [text, speed, stopTyping]);
  
  const skipTyping = useCallback(() => {
    stopTyping();
    setDisplayedText(text);
    setIsFinishedTyping(true);
  }, [text, stopTyping]);

  return { displayedText, isFinishedTyping, skipTyping };
};