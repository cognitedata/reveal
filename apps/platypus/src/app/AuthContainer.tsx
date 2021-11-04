import { useAuthContext } from '@cognite/react-container';
import { setCogniteSDKClient } from './utils/cogniteSdk';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainer = ({ children }: AuthContainerProps) => {
  const { client } = useAuthContext();
  setCogniteSDKClient(client!);
  return <>{children}</>;
};
