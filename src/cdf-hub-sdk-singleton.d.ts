declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';

  export declare function logout(): void;

  export declare function loginAndAuthIfNeeded(
    newTenant: string,
    env?: string
  ): Promise<void>;

  declare const sdk: CogniteClient;
  export default sdk;
}
