import { getProject } from '@cognite/cdf-utilities';
import React from 'react';
import {
  getFromLocalStorage,
  saveToLocalStorage,
  removeItem,
} from '@cognite/storage';

export const sleep = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

// Copied from react-merge-refs library
export function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

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
      return deserialize(valueInLocalStorage);
    }
    return defaultValue;
  });

  const prevKeyRef = React.useRef(projectKey);

  React.useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== projectKey) {
      removeItem(prevKey);
    }
    prevKeyRef.current = projectKey;
    saveToLocalStorage(projectKey, serialize(state));
  }, [projectKey, state, serialize]);

  return [state, setState];
}
