import isFunction from 'lodash/isFunction';
import { useState } from 'react';
import { handleError } from 'utils/handleError';

const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      handleError({
        message: 'Error getting localStorage item',
        ...(error as any),
      });
      return defaultValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore = isFunction(value) ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      handleError({
        message: 'Error setting localStorage item',
        ...(error as any),
      });
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
