import { storage } from '@cognite/storage';
import config from 'configs/datatransfer.config';

// Note: Change the cache key every time changes to the column structure occurs. This "invalidates" users column selection.
const COLUMNS_KEY = 'columns-v2';

export const addSelectedColumnPersistently = (name: string): string[] => {
  const value = storage.getFromLocalStorage<string[]>(COLUMNS_KEY);

  const updatedColumns = value ? [...value, name] : [name];

  storage.saveToLocalStorage(COLUMNS_KEY, updatedColumns);

  return updatedColumns;
};

export const removeSelectedColumnPersistently = (name: string): string[] => {
  const value = storage.getFromLocalStorage<string[]>(COLUMNS_KEY);

  if (value) {
    const updatedColumns = value.filter((item) => item !== name);
    storage.saveToLocalStorage(COLUMNS_KEY, updatedColumns);
    return value;
  }

  // Shouldn't in theory ever happen (getSelectedColumn and addSelectedColumn) init. the local storage.
  return config.initialSelectedColumnNames;
};

export const getSelectedColumnsPersistently = (): string[] => {
  const value = storage.getFromLocalStorage<string[]>(COLUMNS_KEY);

  if (!value) {
    storage.saveToLocalStorage(COLUMNS_KEY, config.initialSelectedColumnNames);
    return config.initialSelectedColumnNames;
  }

  return value;
};
