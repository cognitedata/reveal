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

  // in case if we don't have project name and we are on the root page
  // load empty page and allow the login sub-app to handle the auth
  if (
    !projectName ||
    window.location.pathname === '/' ||
    window.location.pathname.startsWith('/select-project')
  ) {
    return <>{props.children}</>;
  }

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
