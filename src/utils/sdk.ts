import { CogniteClient } from '@cognite/sdk';
import config from 'config';

const CDF_API_BASE_URL = config.cdfApiBaseUrl;

let sdk: CogniteClient;

export function getSdk(
  {
    appId,
    baseUrl,
  }: {
    appId: string;
    baseUrl: string;
  } = {
    appId: 'Cognite Charts',
    baseUrl: CDF_API_BASE_URL,
  }
) {
  if (!sdk) {
    sdk = new CogniteClient({
      appId,
      baseUrl,
    });
  }

  return sdk;
}
