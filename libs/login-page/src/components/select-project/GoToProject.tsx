import React from 'react';

import { parseEnvFromCluster, redirectToApp } from '@cognite/login-utils';

import GoToProjectButton from '../../components/go-to-project-button/GoToProjectButton';
import { parseRef } from '../../utils';

type GoToAADProjectProps = {
  cluster: string;
  projectName: string;
};

const GoToProject = ({
  cluster,
  projectName,
}: GoToAADProjectProps): JSX.Element => {
  const handleGoToAADProject = () => {
    const [refPath, extraParams] = parseRef(window.location.search);
    const path = refPath ? `${projectName}/${refPath}` : projectName;
    const env = parseEnvFromCluster(cluster);
    redirectToApp(path, env, cluster, extraParams);
  };

  return (
    <GoToProjectButton onClick={handleGoToAADProject}>
      {projectName}
    </GoToProjectButton>
  );
};

export default GoToProject;
