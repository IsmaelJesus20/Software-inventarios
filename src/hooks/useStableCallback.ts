import { useCallback, useRef } from 'react';

/**
 * Hook to create stable callbacks that don't change on every render
 * but still use the latest closure values
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}