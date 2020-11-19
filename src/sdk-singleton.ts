import { CogniteClient } from '@cognite/sdk';

import {
  v3Client,
  getAuthState,
  loginAndAuthIfNeeded,
  // @ts-ignore
} from '@cognite/cdf-sdk-singleton';

export default (v3Client as unknown) as CogniteClient;

export { getAuthState, loginAndAuthIfNeeded };
