import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../../providers/FDMProvider';
import { useTypesDataModelQuery } from '../../../dataModels/query/useTypesDataModelQuery';
import { extractFieldsFromSchema } from '../../../extractors';
import { queryKeys } from '../../../queryKeys';

export const useInstancesQuery = () => {
  const client = useFDM();

  const { dataType, instanceSpace, externalId } = useParams();

  const { data: types } = useTypesDataModelQuery();

  return useQuery(
    queryKeys.instance(
      { dataType, instanceSpace, externalId },
      types,
      client.getHeaders
    ),
    async () => {
      if (!(dataType && externalId && instanceSpace)) {
        return Promise.reject(new Error('Missing headers...'));
      }

      const extractedFields = extractFieldsFromSchema(types, dataType);

      // Fix me!
      const fields = extractedFields
        ?.filter(
          (item) =>
            client.isPrimitive(item.type.name) ||
            item.type.name === 'JSONObject'
        )
        .map((item) => item.name);

      if (!fields) {
        return Promise.resolve();
      }

      const instance = await client.getInstanceById<any>(fields, {
        instanceSpace,
        dataType,
        externalId,
      });

      return instance;
    }
  );
};
