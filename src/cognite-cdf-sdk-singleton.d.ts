declare module '@cognite/cdf-sdk-singleton' {
  import { AuthenticatedUser } from '@cognite/auth-utils';
  import { CogniteClient } from '@cognite/sdk';

  export const getAuthState: () => AuthenticatedUser;

  const sdk: CogniteClient;
  export default sdk;
}
