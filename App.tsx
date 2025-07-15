
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BreathingState } from './types';

// Configuration for each state of the breathing cycle
const STATE_CONFIG = {
  [BreathingState.IDLE]: {
    text: 'Ready to Begin?',
    next: BreathingState.INHALE,
    animation: 'scale-100 opacity-75',
    duration: 4,
  },
  [BreathingState.INHALE]: {
    text: 'Breathe In',
    next: BreathingState.HOLD_IN,
    animation: 'scale-125 opacity-100',
    duration: 4,
  },
  [BreathingState.HOLD_IN]: {
    text: 'Hold',
    next: BreathingState.EXHALE,
    animation: 'scale-125 opacity-100',
    duration: 4,
  },
  [BreathingState.EXHALE]: {
    text: 'Breathe Out',
    next: BreathingState.HOLD_OUT,
    animation: 'scale-100 opacity-75',
    duration: 4,
  },
  [BreathingState.HOLD_OUT]: {
    text: 'Hold',
    next: BreathingState.INHALE,
    animation: 'scale-100 opacity-75',
    duration: 4,
  },
};

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<BreathingState>(BreathingState.IDLE);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(STATE_CONFIG[BreathingState.IDLE].duration);

  const transitionSoundRef = useRef<HTMLAudioElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        }
        
        // Play sound for the upcoming state transition
        if (transitionSoundRef.current) {
            transitionSoundRef.current.currentTime = 0;
            transitionSoundRef.current.play().catch(e => console.error("Transition sound playback error:", e));
        }

        // Transition to the next state
        setCurrentState(prevState => {
          const nextState = STATE_CONFIG[prevState].next;
          setCountdown(STATE_CONFIG[nextState].duration);
          return nextState;
        });

        return 0; 
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleToggle = () => {
    const backgroundMusic = backgroundMusicRef.current;
    const transitionSound = transitionSoundRef.current;

    if (isRunning) {
      setIsRunning(false);
      setCurrentState(BreathingState.IDLE);
      setCountdown(STATE_CONFIG[BreathingState.IDLE].duration);
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    } else {
      // User interaction unlocks audio playback
      if (backgroundMusic) {
        backgroundMusic.play().catch(e => console.error("Background music playback error:", e));
      }
      if (transitionSound) {
        transitionSound.currentTime = 0;
        transitionSound.play().catch(e => console.error("Initial transition sound playback error:", e));
      }
      
      setIsRunning(true);
      setCurrentState(BreathingState.INHALE);
      setCountdown(STATE_CONFIG[BreathingState.INHALE].duration);
    }
  };

  const currentConfig = useMemo(() => STATE_CONFIG[currentState], [currentState]);
  const transitionDuration = useMemo(() => `${currentConfig.duration}s`, [currentConfig.duration]);
  
  const ballPositionStyle = useMemo(() => {
    const style: React.CSSProperties = {
      transform: 'translate(-50%, -50%)',
      transitionProperty: 'top, left',
      transitionTimingFunction: 'linear',
      transitionDuration: isRunning ? transitionDuration : '0.3s',
    };

    switch (currentState) {
      case BreathingState.INHALE:
        return { ...style, top: '0%', left: '0%' };
      case BreathingState.HOLD_IN:
        return { ...style, top: '0%', left: '100%' };
      case BreathingState.EXHALE:
        return { ...style, top: '100%', left: '100%' };
      case BreathingState.HOLD_OUT:
        return { ...style, top: '100%', left: '0%' };
      case BreathingState.IDLE:
      default:
        return { ...style, top: '100%', left: '0%' };
    }
  }, [currentState, isRunning, transitionDuration]);


  return (
    <main className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-gray-900 text-white select-none">
      <audio 
        ref={transitionSoundRef} 
        src="https://cdn.pixabay.com/audio/2022/03/15/audio_22b27a364e.mp3" 
        preload="auto"
      ></audio>
      <audio 
        ref={backgroundMusicRef} 
        src="/Calm-Ocean-Waves.mp3" 
        preload="auto" 
        loop
      ></audio>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="https://videos.pexels.com/video-files/4782135/4782135-hd_1920_1080_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Main Content */}
      <div className="z-20 flex flex-col items-center justify-center text-center p-4">
        <div
          className={`relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 bg-blue-500/20 border-2 border-blue-300/50 rounded-2xl shadow-2xl shadow-blue-500/20 backdrop-blur-md transition-all ease-in-out`}
          style={{ transitionDuration: '0.5s' }}
        >
            <div
                aria-hidden="true"
                className={`absolute w-5 h-5 bg-white rounded-full shadow-lg shadow-white/50 transition-opacity duration-500 ${isRunning ? 'opacity-100' : 'opacity-0'}`}
                style={ballPositionStyle}
            />
            <div 
                className={`flex items-center justify-center w-full h-full rounded-2xl bg-white/10 transform transition-all ease-in-out ${currentConfig.animation}`}
                style={{ transitionDuration }}
            >
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl sm:text-5xl font-light tracking-wider">
                        {currentConfig.text}
                    </h1>
                    {isRunning && (
                        <p className="text-7xl sm:text-8xl font-thin mt-4">{countdown}</p>
                    )}
                </div>
            </div>
        </div>

        <button
          onClick={handleToggle}
          aria-label={isRunning ? 'Stop breathing exercise' : 'Start breathing exercise'}
          className="mt-16 px-12 py-4 bg-white/10 border border-white/20 rounded-full text-2xl font-semibold tracking-widest uppercase hover:bg-white/20 hover:scale-105 active:scale-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 backdrop-blur-sm"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>
       <footer className="absolute bottom-4 text-sm text-white/40 z-20">
            <p>Find your center. One breath at a time.</p>
        </footer>
    </main>
  );
};

export default App;
