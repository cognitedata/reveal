import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, getEnv, getProject } from '@cognite/cdf-utilities';

import App from './app/App';
import './set-public-path';

export const AppWrapper = () => {
  const project = getProject();
  const env = getEnv();

  return (
    <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
      <App />
    </AuthWrapper>
  );
};
