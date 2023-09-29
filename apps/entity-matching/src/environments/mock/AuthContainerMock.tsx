import { CogniteClient } from '@cognite/sdk';

import { setCogniteSDKClient } from './cogniteSdk';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainerMock = ({ children }: AuthContainerProps) => {
  const projectName = 'entity-matching';

  const cogniteClient: CogniteClient = new CogniteClient({
    appId: projectName,
    project: projectName,
    noAuthMode: true,
    baseUrl: window.location.origin,
    getToken: async () => 'mock',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cogniteClient.initAPIs();

  setCogniteSDKClient(cogniteClient!);

  return <>{children}</>;
};
