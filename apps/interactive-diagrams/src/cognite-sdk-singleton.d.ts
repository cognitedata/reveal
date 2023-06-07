declare module '@cognite/cdf-sdk-singleton' {
  import { CogniteClient } from '@cognite/sdk';
  import { Flow } from 'types';

  export declare function getFlow(): { flow: Flow };
  export declare function getUserInformation(): Promise<any>;
  export declare function loginAndAuthIfNeeded(
    project: string,
    env?: string
  ): Promise<void>;

  declare const sdk: CogniteClient;
  export default sdk;
}
