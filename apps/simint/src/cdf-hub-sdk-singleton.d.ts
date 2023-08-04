declare module '@cognite/cdf-sdk-singleton' {
  import type { CogniteClient } from '@cognite/sdk';

  export declare type Flow =
    | 'ADFS'
    | 'AZURE_AD'
    | 'COGNITE_AUTH'
    | 'FAKE_IDP'
    | 'OAUTH_GENERIC'
    | 'UNKNOWN';

  export declare function logout(): void;

  export declare function loginAndAuthIfNeeded(
    project: string,
    env?: string
  ): Promise<void>;
  export declare function getToken(): Promise<string>;
  export declare function getFlow(): { flow: Flow };
  export declare function getUserInformation(): Promise<any>;

  declare const sdk: CogniteClient;
  export default sdk;
}
