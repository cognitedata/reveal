import {
  v3Client,
  CogniteClient,
  getAuthState,
  loginAndAuthIfNeeded,
} from '@cognite/cdf-sdk-singleton';

export default v3Client as CogniteClient;

export { getAuthState, loginAndAuthIfNeeded };
