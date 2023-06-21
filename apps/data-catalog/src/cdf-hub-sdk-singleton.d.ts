/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@cognite/cdf-sdk-singleton' {
  import {
    CogniteClient,
    Acl,
    SingleCogniteCapability,
    AclScopeAll,
  } from '@cognite/sdk';

  export declare type Flow =
    | 'COGNITE_AUTH'
    | 'AZURE_AD'
    | 'ADFS'
    | 'OAUTH_GENERIC'
    | 'FAKE_IDP'
    | 'UNKNOWN';

  export declare function getFlow(): { flow: any };
  export declare function getUserInformation(): Promise<{
    displayName?: string;
    id: string;
    mail?: string;
    userPrincipalName?: string;
  }>;
  export declare function loginAndAuthIfNeeded(
    project: string,
    env?: string
  ): Promise<void>;

  declare const sdk: CogniteClient;
  export default sdk;
}
