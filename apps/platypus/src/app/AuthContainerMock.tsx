import { useDispatch } from 'react-redux';
import globalStateSlice from './redux/reducers/global/globalReducer';
import { setCogniteSDKClient } from './utils/cogniteSdk';
import { CogniteClient } from '@cognite/sdk';
import config from './config/config';

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
  });
  cogniteClient.setBaseUrl(window.location.origin);
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
