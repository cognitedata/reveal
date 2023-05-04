import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import head from 'lodash/head';
import { useParams } from 'react-router-dom';
import { FDMClient } from '../../FDMClient';
import { getInstanceById } from '../network/getInstanceById';

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

      const result = await getInstanceById(client, {
        space,
        dataModel,
        version: '1', // FIX_ME
        dataType,
        externalId,
      });

      return head(result.getActorById.items);
    }
  );
};
