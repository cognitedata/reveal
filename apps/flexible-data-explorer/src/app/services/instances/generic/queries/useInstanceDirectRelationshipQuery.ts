import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../../providers/FDMProvider';
import { queryKeys } from '../../../queryKeys';

export const useInstanceRelationshipQuery = ({
  type,
  field,
}: {
  field: string;
  type: string;
}) => {
  const client = useFDM();
  const { dataType, instanceSpace, externalId, dataModel, version, space } =
    useParams();

  return useQuery(
    queryKeys.instanceDirect({ dataType, instanceSpace, externalId }, type),
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

      const instance = await client.getDirectRelationshipInstancesById(
        {
          relatedType: type,
          relatedField: field,
        },
        {
          dataModel,
          version,
          space,
          dataType,
          instanceSpace,
          externalId,
        }
      );

      return instance[field];
    }
  );
};
