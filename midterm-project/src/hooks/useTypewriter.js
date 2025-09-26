import { useState, useEffect, useCallback, useRef } from 'react';
import { audioManager } from '../utils/AudioManager'; // Make sure this path is correct

export const useTypewriter = (text, speed) => {
  const [displayText, setDisplayText] = useState("");
  const [isFinishedTyping, setIsFinishedTyping] = useState(false);
  const idx = useRef(0);
  const displayTextRef = useRef("");
  const typingIntervalRef = useRef(null);

  // Method to skip typing effect
  const skipTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    displayTextRef.current = text;
    setDisplayText(text);
    setIsFinishedTyping(true);
  }, [text]);

  useEffect(() => {
    setDisplayText("");
    displayTextRef.current = "";
    idx.current = 0;
    setIsFinishedTyping(false);

    typingIntervalRef.current = setInterval(() => {
      if (idx.current < text.length) {
        displayTextRef.current += text.charAt(idx.current);
        setDisplayText(() => displayTextRef.current);
        idx.current += 1;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsFinishedTyping(true);
      }
    }, speed);

    return () => {
      clearInterval(typingIntervalRef.current);
      setDisplayText("");
    };
  }, [text, speed]);

  return { displayedText: displayText, isFinishedTyping, skipTyping };
};
