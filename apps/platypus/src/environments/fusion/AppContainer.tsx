import { Store } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import '../../set-public-path';
import GlobalStyles from '@platypus-app/GlobalStyles';

type AppContainerProps = {
  sidecar?: unknown;
  store: Store;
  children: React.ReactNode;
};
export const AppContainer = ({ children, store }: AppContainerProps) => {
  const project = getProject();
  const env = getEnv();

  return (
    <ReduxProvider store={store}>
      <GlobalStyles>
        <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
          <SubAppWrapper title="Data Models">{children}</SubAppWrapper>
        </AuthWrapper>
      </GlobalStyles>
    </ReduxProvider>
  );
};
