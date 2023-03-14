import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import './set-public-path';
import App from './app/App';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  const projectName = 'coding-conventions';
  const project = getProject();
  const env = getEnv();

  return (
    <GlobalStyles>
      <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
        <SubAppWrapper title={projectName}>
          <App />
        </SubAppWrapper>
      </AuthWrapper>
    </GlobalStyles>
  );
};
