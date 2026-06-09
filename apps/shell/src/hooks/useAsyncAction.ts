import { useState, useCallback } from 'react';

interface UseAsyncAction {
  isLoading: boolean;
  error: string;
  setError: (msg: string) => void;
  execute: (action: () => Promise<void>) => void;
}

export function useAsyncAction(): UseAsyncAction {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback((action: () => Promise<void>) => {
    setIsLoading(true);
    setError('');
    action()
      .catch(() => setError('Network error. Please check your connection.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { isLoading, error, setError, execute };
}
