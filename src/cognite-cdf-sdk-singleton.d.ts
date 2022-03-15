declare module '@cognite/cdf-sdk-singleton' {
  import { IDPType } from '@cognite/login-utils';
  import { CogniteClient } from '@cognite/sdk';

  export declare function getFlow(): { flow: IDPType };
  export declare function getToken(): Promise<string>;
  export declare function loginAndAuthIfNeeded(
    newTenant: string,
    env?: string
  ): Promise<void>;

  declare const sdk: CogniteClient;
  export default sdk;
}
