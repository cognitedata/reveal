import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { extractFieldsFromSchema } from '../../extractors';
import { FDMClient } from '../../FDMClient';

export const useInstancesQuery = () => {
  const { space, dataModel, version, dataType, nodeSpace, externalId } =
    useParams();

  const sdk = useSDK();
  const client = new FDMClient(sdk, { dataModel, space, version });

  return useQuery(
    [
      'instances',
      'single',
      space,
      dataModel,
      version,
      dataType,
      nodeSpace,
      externalId,
    ],
    async () => {
      if (
        !(space && dataModel && version && dataType && externalId && nodeSpace)
      ) {
        return Promise.reject(new Error('Missing headers...'));
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
        nodeSpace,
        space,
        dataModel,
        version,
        dataType,
        externalId,
      });

      return instance;
    }
  );
};
