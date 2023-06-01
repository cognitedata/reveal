import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../providers/FDMProvider';
import { extractFieldsFromSchema } from '../../extractors';
import { queryKeys } from '../../queryKeys';

export const useInstancesQuery = () => {
  const { dataType, instanceSpace, externalId } = useParams();

  const client = useFDM();

  return useQuery(
    queryKeys.instance(
      { dataType, instanceSpace, externalId },
      client.getHeaders
    ),
    async () => {
      if (!(dataType && externalId && instanceSpace)) {
        return Promise.reject(new Error('Missing headers...'));
      }

      const model = await client.getDataModelById();
      const schema = client.parseSchema(model?.graphQlDml);

      const extractedFields = extractFieldsFromSchema(schema, dataType);

      const fields = extractedFields
        ?.filter((item) => !item.type.custom)
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
