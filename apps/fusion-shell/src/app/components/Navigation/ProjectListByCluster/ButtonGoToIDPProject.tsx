import React from 'react';

import styled from 'styled-components';

import {
  getCluster,
  getEnv,
  getProject,
  isUsingUnifiedSignin,
  unifiedSignInAppName,
} from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';

import CurrentProject from './CurrentProject';
import { readLoginHints } from '@cognite/auth-react/src/lib/base';

const { idpInternalId, organization } = readLoginHints() ?? {};

type ButtonGoToIDPProjectProps = {
  cluster: string;
  projectName: string;
};

const ButtonGoToIDPProject = ({
  cluster,
  projectName,
}: ButtonGoToIDPProjectProps): JSX.Element => {
  const currentCluster = getCluster();
  const currentProject = getProject();
  const isCurrentProject =
    currentCluster === cluster && currentProject === projectName;

  const getHrefLink = () => {
    const env = getEnv();

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('env', env ?? '');
    urlSearchParams.append('cluster', cluster);
    if (isUsingUnifiedSignin()) {
      urlSearchParams.append('project', projectName);
      if (idpInternalId) {
        urlSearchParams.append('idpInternalId', idpInternalId);
      }
      if (organization) {
        urlSearchParams.append('organization', organization);
      }
    }
    const baseUrl = isUsingUnifiedSignin()
      ? `${unifiedSignInAppName}/${projectName}`
      : `${projectName}`;

    return `/${baseUrl}?${urlSearchParams.toString()}`;
  };

  if (isCurrentProject) {
    return <CurrentProject projectName={projectName} />;
  }

  const goToProjectHandler = () => {
    const href = getHrefLink();
    window.location.href = href;
  };

  return (
    <StyledGoToIDPProjectButton type="ghost" onClick={goToProjectHandler}>
      {projectName}
    </StyledGoToIDPProjectButton>
  );
};

const StyledGoToIDPProjectButton = styled(Button)`
  justify-content: flex-start;
`;

export default ButtonGoToIDPProject;
