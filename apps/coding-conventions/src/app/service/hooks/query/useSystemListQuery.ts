import { useQuery } from '@tanstack/react-query';
import { Database } from '../../storage/Database';

export const useSystemListQuery = () => {
  return useQuery(['system'], () => {
    return Database.listSystems();
  });
};
