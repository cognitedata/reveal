import { useAuthContext } from '@cognite/react-container';
import { useDispatch } from 'react-redux';
import globalStateSlice from '@platypus-app/redux/reducers/global/globalReducer';
import { setCogniteSDKClient } from './cogniteSdk';
import { CogniteClient } from '@cognite/sdk';
type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainer = ({ children }: AuthContainerProps) => {
  const dispatch = useDispatch();
  const { client, authState } = useAuthContext();

  if (!client || !authState) {
    return null;
  }

  // TODO: Find better way to fix typing
  setCogniteSDKClient(client as unknown as CogniteClient);

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
