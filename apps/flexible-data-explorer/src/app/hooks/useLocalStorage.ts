import useLocalStorageState from 'use-local-storage-state';

import { localStorageKeys } from '../constants/localStorageKeys';
import { DataModel } from '../services/types';

export const useDataModelLocalStorage = () => {
  return useLocalStorageState<Required<DataModel> | undefined>(
    localStorageKeys.dataModel,
    {
      defaultValue: undefined,
    }
  );
};
