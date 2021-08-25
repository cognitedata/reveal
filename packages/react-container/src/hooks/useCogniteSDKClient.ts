import { CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';

import { setCogniteSDKClient } from '../internal/sdkClient';

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
