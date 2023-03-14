export const getLocalStorageObjectByKey = <T>(key: string): T | undefined => {
  if (!window.localStorage) return undefined;

  const objectString = window.localStorage.getItem(key);

  if (!objectString) return undefined;

  return JSON.parse(objectString) as T;
};
