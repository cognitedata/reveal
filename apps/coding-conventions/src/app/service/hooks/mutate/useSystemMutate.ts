import { useMutation, useQueryClient } from '@tanstack/react-query';
import { System } from '../../../types';
import { Database } from '../../storage/Database';

export const useSystemMutate = () => {
  const client = useQueryClient();

  return useMutation(
    (data: Omit<System, 'id' | 'updatedAt'>) => {
      return Database.createSystem(
        data.title,
        data.resource,
        data.description,
        data.structure
      );
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['system']);
      },
    }
  );
};
