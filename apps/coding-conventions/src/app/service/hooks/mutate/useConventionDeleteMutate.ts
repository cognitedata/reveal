import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Convention } from '../../../types';
import { Database } from '../../storage/Database';

export const useConventionCreateMutate = () => {
  const client = useQueryClient();
  const { systemId } = useParams();

  return useMutation(
    ({ id }: Convention) => {
      if (!systemId) {
        throw new Error('Missing system id');
      }

      return Database.deleteConvention(id);
    },
    {
      onMutate: async (deletedConvention) => {
        await client.cancelQueries({ queryKey: ['convention', systemId] });

        const previousTodos = client.getQueryData<Convention[]>([
          'convention',
          systemId,
        ]);

        client.setQueryData<Convention[]>(['convention', systemId], (old) =>
          [...(old || [])].filter((item) => item.id !== deletedConvention.id)
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
