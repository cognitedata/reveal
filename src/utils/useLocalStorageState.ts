import React, { useEffect } from 'react';
import { getProject } from '@cognite/cdf-utilities';
import { getFromLocalStorage, storage } from '@cognite/storage';
import merge from 'lodash/merge';
/**
 *   Hook that is similar to the useState  persisting the state in the localstate with passing projectKey to it
 * @param key  that will be persist in localstorage
 * @param defaultValue initialstate of that object
 * @param param an object that allows to specify serializer and deserializer before setting the localstorage
 * Returns the parameter similar to useState
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T | string = '',
  { serialize = JSON.stringify, deserialize = JSON.parse } = {}
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const projectKey = `${getProject()}-${key}`;
  const [state, setState] = React.useState<T>(() => {
    const valueInLocalStorage = getFromLocalStorage<string>(projectKey);
    if (valueInLocalStorage) {
      return merge(defaultValue, deserialize(valueInLocalStorage));
    }
    return defaultValue;
  });

  useEffect(() => {
    setState(() => {
      const valueInLocalStorage = getFromLocalStorage<string>(projectKey);
      if (valueInLocalStorage) {
        return merge(defaultValue, deserialize(valueInLocalStorage));
      }
      return defaultValue;
    });
  }, [defaultValue, deserialize, projectKey]);

  const prevKeyRef = React.useRef(projectKey);

  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== projectKey) {
      storage.removeItem(prevKey);
    }
    prevKeyRef.current = projectKey;
    storage.saveToLocalStorage(projectKey, serialize(state));
  }, [projectKey, state, serialize]);

  return [state, setState];
}
