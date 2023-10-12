import { useState } from 'react';

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (_: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item === null ? defaultValue : (JSON.parse(item) as T);
    } catch (error) {
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  };

  return [storedValue, setValue];
};
