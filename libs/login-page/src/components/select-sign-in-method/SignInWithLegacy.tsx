import React from 'react';

import {
  parseEnvFromCluster,
  redirectToApp,
  saveSelectedIdpDetails,
  LegacyProject,
  useLegacyProject,
} from '@cognite/login-utils';

import GoToProjectButton from '../../components/go-to-project-button/GoToProjectButton';
import { parseRef } from '../../utils';

type SignInWithLegacyProps = LegacyProject & {
  isSignInRequiredLabelShown?: boolean;
};

const SignInWithLegacy = ({
  cluster,
  internalId,
  isSignInRequiredLabelShown,
  projectName,
  type,
}: SignInWithLegacyProps) => {
  const {
    data: isProjectValid,
    isFetched: isFetchedProject,
    isError,
  } = useLegacyProject(cluster, projectName);

  const handleSignInWithLegacy = () => {
    saveSelectedIdpDetails({ internalId, type });

    const [refPath, extraParams] = parseRef(window.location.search);
    const path = refPath ? `${projectName}/${refPath}` : projectName;
    const env = parseEnvFromCluster(cluster);
    redirectToApp(path, env, cluster, extraParams);
  };

  if (isError || !isFetchedProject) {
    return null;
  }

  return (
    <GoToProjectButton
      disabled={!isProjectValid}
      isSignInRequiredLabelShown={isSignInRequiredLabelShown}
      loading={!isFetchedProject}
      onClick={handleSignInWithLegacy}
    >
      {projectName}
    </GoToProjectButton>
  );
};

export default SignInWithLegacy;
