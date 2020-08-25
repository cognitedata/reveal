import { CogniteClient } from 'cognite-sdk-v3';

import {
  v3Client,
  getAuthState,
  loginAndAuthIfNeeded,
} from '@cognite/cdf-sdk-singleton';

export default v3Client as CogniteClient;

export { getAuthState, loginAndAuthIfNeeded };
