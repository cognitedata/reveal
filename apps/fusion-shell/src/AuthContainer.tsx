import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthContainer as CdfAuthContainer,
  getProject,
} from '@cognite/cdf-utilities';

import { checkIfUserHasAccessToProject } from './app/utils/login-utils';

export interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = (props: AuthContainerProps) => {
  const projectName = getProject();

  return (
    <CdfAuthContainer
      sdk={sdk}
      login={() =>
        loginAndAuthIfNeeded().then(() => {
          checkIfUserHasAccessToProject(projectName);
        })
      }
    >
      {props.children}
    </CdfAuthContainer>
  );
};
