import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../../providers/FDMProvider';
import { queryKeys } from '../../../queryKeys';

export const useInstancesQuery = () => {
  const client = useFDM();

  const { dataModel, version, space, dataType, instanceSpace, externalId } =
    useParams();

  return useQuery(
    queryKeys.instance({ dataType, instanceSpace, externalId }),
    async () => {
      if (
        !(
          dataType &&
          externalId &&
          instanceSpace &&
          dataModel &&
          version &&
          space
        )
      ) {
        return Promise.reject(new Error('Missing headers...'));
      }

      return client.getInstancesById({
        dataModel,
        version,
        space,
        dataType,
        instanceSpace,
        externalId,
      });
    }
  );
};
