declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';

  const sdk: CogniteClient;
  export default sdk;
}
