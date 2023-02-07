import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Convention } from '../../../types';
import { Database } from '../../storage/Database';

export const useConventionCreateMutate = () => {
  const client = useQueryClient();
  const { systemId } = useParams();

  return useMutation(
    (data: Omit<Convention, 'id' | 'conventions'>) => {
      if (!systemId) {
        throw new Error('Missing system id');
      }

      return Database.createConvention(systemId, {
        keyword: data.keyword,
        start: data.start,
        end: data.end,
      });
    },
    {
      onMutate: async (newConvention) => {
        await client.cancelQueries({ queryKey: ['convention', systemId] });

        const previousTodos = client.getQueryData<Convention[]>([
          'convention',
          systemId,
        ]);

        client.setQueryData<Omit<Convention, 'id' | 'conventions'>[]>(
          ['convention', systemId],
          (old) => [...(old || []), newConvention]
        );

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
