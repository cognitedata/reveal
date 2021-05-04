declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';

  declare const sdk: CogniteClient;
  export default sdk;
}
