import { useState } from 'react';

export const useLocalStorage = <T extends Object>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      // Silently fail
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Silently fail
    }
  };

  return [storedValue, setValue];
};

export const setItemInStorage = <T extends Object>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // silently fail
  }
};

export const getItemFromStorage = <T extends Object>(key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : undefined;
  } catch (error) {
    // silently fail
    return undefined;
  }
};
