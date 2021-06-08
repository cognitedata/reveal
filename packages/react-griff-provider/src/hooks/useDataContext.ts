import { useContext } from 'react';
import DataContext, { Data } from '../context/Data';

export function useDataContext(): Data {
  return useContext(DataContext);
}
