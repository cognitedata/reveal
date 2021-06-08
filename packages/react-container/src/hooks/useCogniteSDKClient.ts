import { CogniteClient } from '@cognite/sdk';
import { setCogniteSDKClient } from 'internal';
import { useMemo } from 'react';

export const useCogniteSDKClient = (
  appId?: string,
  options?: {
    baseUrl?: string;
  }
): CogniteClient =>
  useMemo<CogniteClient>(() => {
    const newClient = new CogniteClient({ appId: appId || '' });

    if (options && options.baseUrl) {
      newClient.setBaseUrl(options.baseUrl);
    }

    setCogniteSDKClient(newClient);

    return newClient;
  }, []);
