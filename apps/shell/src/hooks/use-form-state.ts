import { useState, useCallback } from 'react';

type SetField<T> = <K extends keyof T>(key: K, value: T[K]) => void;

export function useFormState<T extends Record<string, unknown>>(
  initial: T,
): [T, SetField<T>] {
  const [form, setForm] = useState<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  return [form, setField];
}
