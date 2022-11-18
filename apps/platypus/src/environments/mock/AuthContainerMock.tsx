import { useDispatch } from 'react-redux';
import globalStateSlice from '../../app/redux/reducers/global/globalReducer';
import { setCogniteSDKClient } from '../cogniteSdk';
import { CogniteClient } from '@cognite/sdk';
import config from '../../app/config/config';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainerMock = ({ children }: AuthContainerProps) => {
  const dispatch = useDispatch();
  const authState = {
    email: 'mock@cognite.com',
    loggedIn: true,
    project: config.APP_APP_ID,
    id: '123456789',
  };

  const cogniteClient: CogniteClient = new CogniteClient({
    appId: config.APP_APP_ID,
    project: 'mock',
    noAuthMode: true,
    baseUrl: window.location.origin,
    getToken: async () => 'mock',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cogniteClient.initAPIs();

  setCogniteSDKClient(cogniteClient!);

  dispatch(
    globalStateSlice.actions.setAuthenticatedUser({
      project: authState.project as string,
      projectId: authState.id as string,
      user: authState.email as string,
    })
  );

  return <>{children}</>;
};
