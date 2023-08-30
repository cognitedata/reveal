import React from 'react';

import styled from 'styled-components';

import { getCluster, getEnv, getProject } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';

import CurrentProject from './CurrentProject';

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
    const baseUrl = projectName;

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
  &&& {
    justify-content: flex-start;
  }
`;

export default ButtonGoToIDPProject;
