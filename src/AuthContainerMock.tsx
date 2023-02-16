import { CogniteClient } from '@cognite/sdk';
import { setCogniteSDKClient } from './utils/cogniteSdk';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainerMock = ({ children }: AuthContainerProps) => {
  const cogniteClient: CogniteClient = new CogniteClient({
    appId: 'data-sets',
    project: 'platypus',
    baseUrl: window.location.origin,
    getToken: async () => 'mock',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cogniteClient.initAPIs();

  setCogniteSDKClient(cogniteClient!);

  return <>{children}</>;
};
