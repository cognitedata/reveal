import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { extractFieldsFromSchema } from '../../extractors';
import { FDMClient } from '../../FDMClient';

export const useInstancesQuery = () => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);

  const { space, dataModel, version, dataType, externalId } = useParams();

  return useQuery(
    ['instances', 'single', space, dataModel, version, dataType, externalId],
    async () => {
      if (!(space && dataModel && version && dataType && externalId)) {
        return Promise.resolve();
      }

      const model = await client.getDataModelById({
        space,
        dataModel,
        version,
      });
      const schema = client.parseSchema(model?.graphQlDml);

      const extractedFields = extractFieldsFromSchema(schema, dataType);

      const fields = extractedFields
        ?.filter((item) => !item.type.custom)
        .map((item) => item.name);

      if (!fields) {
        return Promise.resolve();
      }

      const instance = await client.getInstanceById<any>(fields, {
        space,
        dataModel,
        version, // FIX_ME
        dataType,
        externalId,
      });

      return instance;
    }
  );
};
