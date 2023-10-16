import { SpaceInstanceDTO } from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from 'brandi-react';

import { TOKENS } from '../di';
import { apiCommandFuncWrapper } from '../utils/api-callback-wrappers';
import { QueryKeys } from '../utils/queryKeys';

export const useSpaces = () => {
  const listSpacesQuery = useInjection(TOKENS.listSpacesQuery);
  const listSpacesMaxLimit = 1000;

  return useQuery<SpaceInstanceDTO[], string | any>(
    QueryKeys.SPACES_LIST,
    async () =>
      apiCommandFuncWrapper<SpaceInstanceDTO[]>(() =>
        listSpacesQuery.execute({
          limit: listSpacesMaxLimit,
        })
      )
  );
};
