import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Database } from '../../storage/Database';

export const useSystemQuery = () => {
  const { systemId } = useParams();

  return useQuery(
    ['system', systemId],
    ({ queryKey: [_, key] }) => {
      return Database.getSystem(key!);
    },
    { enabled: !!systemId }
  );
};
