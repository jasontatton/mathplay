import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export const useKeyboardControls = () => {
  const { toggleRunning, reset, setSpeed, speed } = useSimulationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          toggleRunning();
          break;
        case 'r':
          reset();
          break;
        case 'arrowup':
          setSpeed(Math.min(speed + 0.1, 5));
          break;
        case 'arrowdown':
          setSpeed(Math.max(speed - 0.1, 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRunning, reset, setSpeed, speed]);
};
