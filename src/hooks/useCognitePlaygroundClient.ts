import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { useMemo } from 'react';
import { getProject } from '@cognite/cdf-utilities';
import sdk, { getToken } from '@cognite/cdf-sdk-singleton';

export const useCognitePlaygroundClient = () => {
  const subAppName = 'cdf-vision-subapp';

  const cogniteClientPlayground = useMemo(() => {
    return new CogniteClientPlayground({
      appId: subAppName,
      baseUrl: sdk.getBaseUrl(),
      project: getProject(),
      getToken: () => getToken(),
    });
  }, []);

  return cogniteClientPlayground;
};
