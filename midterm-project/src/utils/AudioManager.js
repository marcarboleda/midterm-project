import musicURL from '../assets/audio/main.mp3';
import choiceURL from '../assets/audio/click.wav'; 
import gameOverURL from '../assets/audio/game-over.mp3';
import damageURL from '../assets/audio/damage.mp3';
import victoryURL from '../assets/audio/victory.mp3';

const audioFiles = {
  music: new Audio(musicURL),
  choice: new Audio(choiceURL),
  gameOver: new Audio(gameOverURL),
  damage: new Audio(damageURL),
  victory: new Audio(victoryURL),
};

// Configure the music file we just loaded.
if (audioFiles.music) {
  audioFiles.music.loop = true;
  audioFiles.music.volume = 0.08;
}

if (audioFiles.choice) {
    audioFiles.choice.volume = 0.9; 
}

if (audioFiles.gameOver) {
  audioFiles.gameOver.volume = 0.5; 
}

if (audioFiles.damage) {
  audioFiles.damage.volume = 0.5; 
}

if (audioFiles.victory) {
  audioFiles.victory.volume = 0.9; 
}

export const audioManager = {
  play: (sound) => {
    if (audioFiles[sound]) {
      audioFiles[sound].currentTime = 0;
      audioFiles[sound].play().catch(e => console.error(`Audio play failed for ${sound}:`, e));
    }
  },
  stop: (sound) => {
    if (audioFiles[sound]) {
      audioFiles[sound].pause();
      audioFiles[sound].currentTime = 0;
    }
  },
  startAmbientMusic: () => {
    if (audioFiles.music) {
      audioFiles.music.play().catch(e => console.error("Music could not be started:", e));
    }
  }
};