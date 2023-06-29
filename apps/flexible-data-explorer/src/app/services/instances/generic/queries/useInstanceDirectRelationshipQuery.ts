import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../../providers/FDMProvider';
import { useTypesDataModelQuery } from '../../../dataModels/query/useTypesDataModelQuery';
import { extractFieldsFromSchema } from '../../../extractors';
import { queryKeys } from '../../../queryKeys';

export const useInstanceRelationshipQuery = ({
  type,
  field,
}: {
  field: string;
  type: string;
}) => {
  const client = useFDM();
  const { dataType, instanceSpace, externalId } = useParams();
  const { data: types } = useTypesDataModelQuery();

  return useQuery(
    queryKeys.instanceDirect(
      { dataType, instanceSpace, externalId },
      client.getHeaders,
      type
    ),
    async () => {
      if (!(dataType && externalId && instanceSpace && types)) {
        return Promise.reject(new Error('Missing headers...'));
      }

      const extractedFields = extractFieldsFromSchema(types, type);

      // Fix me!
      const fields = extractedFields
        ?.filter((item) => client.isPrimitive(item.type.name))
        .map((item) => item.name);

      if (!fields) {
        return Promise.reject(new Error('Missing fields...'));
      }

      // TOTALLY FIX THIS!
      const instance = await client.getInstanceById<any>(
        [
          {
            [field]: [...fields, 'externalId'],
          },
        ],
        {
          instanceSpace,
          dataType,
          externalId,
        }
      );

      return instance[field];
    },
    {
      enabled: !!types,
    }
  );
};
