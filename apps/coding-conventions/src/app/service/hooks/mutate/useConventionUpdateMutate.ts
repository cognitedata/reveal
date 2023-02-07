import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Convention } from '../../../types';
import { Database } from '../../storage/Database';

export const useConventionUpdateMutate = () => {
  const client = useQueryClient();
  const { systemId } = useParams();

  return useMutation(
    (data: Convention[]) => {
      if (!systemId) {
        throw new Error('Missing system id');
      }

      return Database.updateConventions(systemId, data);
    },
    {
      onMutate: async (updatingConventions) => {
        await client.cancelQueries({ queryKey: ['convention', systemId] });

        const previousTodos = client.getQueryData<Convention[]>([
          'convention',
          systemId,
        ]);

        client.setQueryData<Convention[]>(['convention', systemId], (old) => [
          ...(old || []),
          ...updatingConventions,
        ]);

        return { previousTodos };
      },
      onError: (_error, _data, context) => {
        client.setQueryData(['convention', systemId], context?.previousTodos);
      },
      onSettled: () => {
        client.invalidateQueries(['convention', systemId]);
      },
    }
  );
};
