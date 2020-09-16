import { CogniteClient } from '@cognite/sdk';
import { SIDECAR } from 'utils/sidecar';

const sdk = new CogniteClient({
  appId: SIDECAR.applicationId,
  baseUrl: 'https://api.cognitedata.com',
});

export default sdk;
