import React from 'react';

import { parseEnvFromCluster, redirectToApp } from '@cognite/login-utils';

import GoToProjectButton from '../../components/go-to-project-button/GoToProjectButton';

type GoToAADProjectProps = {
  cluster: string;
  projectName: string;
};

const GoToProject = ({
  cluster,
  projectName,
}: GoToAADProjectProps): JSX.Element => {
  const handleGoToProject = () => {
    const env = parseEnvFromCluster(cluster);
    redirectToApp(projectName, { env, cluster });
  };

  return (
    <GoToProjectButton onClick={handleGoToProject}>
      {projectName}
    </GoToProjectButton>
  );
};

export default GoToProject;
