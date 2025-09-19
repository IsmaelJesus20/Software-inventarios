import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // en milisegundos
  onIdle?: () => void;
  onActive?: () => void;
  events?: string[];
}

export function useIdleTimer({
  timeout = 300000, // 5 minutos por defecto
  onIdle,
  onActive,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
}: UseIdleTimerOptions) {
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isIdleRef.current) {
      isIdleRef.current = false;
      onActive?.();
    }

    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      onIdle?.();
    }, timeout);
  }, [timeout, onIdle, onActive]);

  useEffect(() => {
    // Inicializar timer
    resetTimer();

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      // Cleanup
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetTimer, events]);

  return {
    isIdle: isIdleRef.current,
    resetTimer
  };
}

export default useIdleTimer;