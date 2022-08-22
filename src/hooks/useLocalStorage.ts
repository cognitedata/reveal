import { useState } from 'react';

/**
 * The useLocalStorage hook supports only object types.
 * It is highly discouraged to use non-object types as a value.
 */
export const useLocalStorage = <T extends Object>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      // silently fail
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // silently fail
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
