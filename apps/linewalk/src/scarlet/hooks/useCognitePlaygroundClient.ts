import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { useAuthContext } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { useMemo } from 'react';

export const useCognitePlaygroundClient = () => {
  const { client, authState } = useAuthContext();

  const cogniteClientPlayground = useMemo(() => {
    if (client && authState?.token) {
      return new CogniteClientPlayground({
        appId: sidecar.applicationId,
        baseUrl: sidecar.cdfApiBaseUrl,
        project: client.project,
        getToken: () => Promise.resolve(authState.token!),
      });
    }
    return undefined;
  }, [client, authState]);

  return cogniteClientPlayground;
};
