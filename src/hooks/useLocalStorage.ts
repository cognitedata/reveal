import { useState } from 'react';

import { fireErrorNotification } from 'utils/handleError';

const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      fireErrorNotification(error);
      return defaultValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore =
        // eslint-disable-next-line
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      fireErrorNotification(error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
