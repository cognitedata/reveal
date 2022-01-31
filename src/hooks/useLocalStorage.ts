import { useState } from 'react';
import isFunction from 'lodash/isFunction';

const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (val: T) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      // Silently fail
      return defaultValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore = isFunction(value) ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Silently fail
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;

export const setItemInStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // silently fail
  }
};

export const getItemFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  } catch (e) {
    // silently fail
    return undefined;
  }
};
