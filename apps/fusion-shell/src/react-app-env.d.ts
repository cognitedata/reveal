// / <reference types="react-scripts" />
declare module '*.svg' {
  const content: any;
  export default content;
}
declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.less';
declare module '*.css';
declare module '@cognite/gcs-browser-upload';
declare module 'react-split';

declare module '@cognite/cdf-sdk-singleton' {
  import { IDPType } from '@cognite/login-utils';
  import { CogniteClient } from '@cognite/sdk';

  export declare function logout(): void;

  export declare function loginAndAuthIfNeeded(
    project: string,
    env?: string
  ): Promise<void>;
  export declare function getToken(): Promise<string>;
  export declare function getFlow(): { flow: IDPType };
  export declare function getUserInformation(): Promise<any>;

  declare const sdk: CogniteClient;
  export default sdk;
}

declare module 'worker-loader*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}
