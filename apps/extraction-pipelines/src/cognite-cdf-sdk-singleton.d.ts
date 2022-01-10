declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';
  import { Flow } from 'types';

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
