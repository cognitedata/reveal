import { useAuthContext } from '@cognite/react-container';
import { useDispatch } from 'react-redux';
import globalStateSlice from '@platypus-app/redux/reducers/global/globalReducer';
import { setCogniteSDKClient } from './cogniteSdk';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainer = ({ children }: AuthContainerProps) => {
  const dispatch = useDispatch();
  const { client, authState } = useAuthContext();

  if (!client || !authState) {
    return null;
  }
  setCogniteSDKClient(client!);

  if (authState !== undefined) {
    dispatch(
      globalStateSlice.actions.setAuthenticatedUser({
        project: authState.project as string,
        projectId: authState.id as string,
        user: authState.email as string,
      })
    );
  }
  return <>{children}</>;
};
