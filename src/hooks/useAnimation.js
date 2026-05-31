import { useState, useEffect, useRef } from "react";

export function useAnimation(steps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds per step
  const intervalRef = useRef(null);

  // --- Auto play logic ---
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, steps]);

  // --- Controls ---
  const play = () => {
    if (currentStepIndex >= steps.length - 1) return;
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const nextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  // --- Current step data ---
  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;
  const isFinished = currentStepIndex >= steps.length - 1;
  const progress =
    steps.length > 1
      ? Math.round((currentStepIndex / (steps.length - 1)) * 100)
      : 0;

  return {
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isPlaying,
    isFinished,
    progress,
    speed,
    play,
    pause,
    nextStep,
    prevStep,
    reset,
    changeSpeed,
  };
}