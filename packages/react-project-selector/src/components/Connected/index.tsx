import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import { getFlow, removeFlow } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';

import LoginContext from '../../context';
import { Card, Flex, Box, Text, FatButton } from '../common';
import InfoMessage from '../common/InfoMessage';
import getUser from '../../requests/getUser';
import getProjects from '../../requests/getProjects';
import useRecentProjects from '../../hooks/useRecentProjects';

import ProjectsList from './ProjectsList';
import ConnectedHeader from './ConnectedHeader';

interface ConnectedProps {
  logout: () => Promise<void>;
}

const Connected = ({ logout }: ConnectedProps) => {
  const { options } = getFlow();
  const { cluster, move } = useContext(LoginContext);

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery('getUserFromMsft', getUser);
  const {
    data: allProjects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery('getProjects', getProjects);

  const { recentProjects, addToRecentProjects } = useRecentProjects({
    recentProjectsKey: `${user?.id}_${cluster}_${options?.directory ?? ''}`,
  });

  const history = useHistory();

  const openProject = (p: string) => {
    // In case this project has both legacy and OIDC enabled
    // remove the LS entry for legacy
    // because if its there it takes precedence over the OIDC one
    // and this would cause the the fusion app to think the user logged in with legacy
    // and now show him the expected settings
    removeFlow(p, cluster);
    move(p);
  };

  const doLogout = () => logout().then(() => history.push('/'));

  const goToSignInWithProjectName = () =>
    logout().then(() => history.push('signInWithProjectName'));

  if (projectsError || userError) {
    doLogout();
    return null;
  }

  if (projectsLoading || userLoading) {
    return <Loader />;
  }

  return (
    <Card>
      <Flex direction="column" heightFull>
        <ConnectedHeader user={user} />
        <Box flex={1} scrollY>
          <Flex direction="column" heightFull>
            <Box p={32} spaceY={20} flex={1}>
              <div>
                <Text size={18}>Select project</Text>
              </div>
              {recentProjects.length > 0 && allProjects.length > 1 && (
                <ProjectsList
                  projects={recentProjects}
                  title="Last used"
                  onProjectClick={(p) => openProject(p)}
                />
              )}

              {allProjects.length > 0 && (
                <ProjectsList
                  projects={allProjects}
                  search
                  title="All Projects"
                  onProjectClick={(p) => {
                    addToRecentProjects(p);
                    openProject(p);
                  }}
                />
              )}

              <hr />

              <InfoMessage
                id="connectedPage"
                details={
                  <>
                    If your project is not on the list, try{' '}
                    <span
                      onClick={goToSignInWithProjectName}
                      onKeyPress={goToSignInWithProjectName}
                      role="button"
                      tabIndex={0}
                    >
                      <Text cursor="pointer" color="#6B83FB">
                        signing in with the CDF project name
                      </Text>
                    </span>
                    .
                  </>
                }
              />
            </Box>
            <FatButton
              type="link"
              icon="Logout"
              iconPlacement="right"
              onClick={doLogout}
            >
              Sign in to another project or account
            </FatButton>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

export default Connected;
