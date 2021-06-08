import * as React from 'react';
import { useQuery } from 'react-query';
import { Button, Dropdown, Menu, Loader } from '@cognite/cogs.js';
import { CogniteAuth, getFlow } from '@cognite/auth-utils';

import { StyledProjectFormContainer } from './elements';
import { fetchProjects } from './fetchProjects';

interface Props {
  enabled?: boolean;
  authClient?: CogniteAuth;
  onSelected: (project: string, cluster: string) => void;
}
const ProjectSelector: React.FC<Props> = ({
  enabled,
  onSelected,
  authClient,
}) => {
  const [selectedProject, setSelectedProject] = React.useState<string>();
  const [showMenu, setShowMenu] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const { flow } = getFlow();
  const {
    data = [],
    isFetched,
    isError,
    refetch,
  } = useQuery<{ projectUrlName: string }[] | undefined>(
    ['projects'],
    async () => fetchProjects({ enabled, authClient }),
    {
      enabled,
    }
  );

  const projects = data.map((d) => ({
    urlName: d.projectUrlName,
    label: d.projectUrlName,
  }));

  // if there is only one
  // then we auto select that for the user
  React.useEffect(() => {
    if (projects.length === 1) {
      setSelectedProject(projects[0].urlName);
    }
  }, [projects]);

  React.useEffect(() => {
    if (enabled) {
      refetch(); // projects
    }
  }, [enabled]);

  const ProjectsContent = (
    <Menu>
      {projects.map((dir) => (
        <Menu.Item
          onClick={() => {
            setSelectedProject(dir.urlName);
            setShowMenu(false);
          }}
          key={dir.urlName}
        >
          {dir.urlName}
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleContinue = () => {
    if (authClient && selectedProject) {
      onSelected(selectedProject, '');
    }
  };

  const handleLogout = async () => {
    if (authClient) {
      authClient.logout();
      window.location.href = '/';
    }
  };

  const retryFetchOnce = () => {
    if (authClient) {
      if (flow && retryCount < 1) {
        setRetryCount(retryCount + 1);
        authClient.loginInitial({
          flow,
        });
        refetch(); // projects
      } else {
        handleLogout();
      }
    }
  };

  // we need to have the enabled check here render nothing in this case
  // so that the parent component knows of the existence of this component
  // and can render the height accordingly
  if (!enabled) {
    return null;
  }

  if (!isFetched) {
    return <Loader />;
  }

  const showError = isError || !projects;

  if (showError) {
    retryFetchOnce();

    return (
      <div style={{ margin: '4rem 0rem' }}>
        <p style={{ color: '#404040', fontWeight: 1000, fontSize: 16 }}>
          Error
        </p>
        There has been an error fetching the projects list.
      </div>
    );
  }

  return (
    <StyledProjectFormContainer>
      <p style={{ color: '#404040', fontWeight: 600, fontSize: 13 }}>Project</p>
      <Dropdown
        content={ProjectsContent}
        visible={showMenu}
        onClickOutside={() => setShowMenu(false)}
      >
        <Button
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}
          onClick={() => setShowMenu(true)}
          disabled={projects.length <= 1}
          type="tertiary"
          icon="Down"
          iconPlacement="right"
        >
          {projects.length === 0
            ? 'No available projects'
            : selectedProject || 'Select a project'}
        </Button>
      </Dropdown>
      <br />
      <Button
        style={{ height: 40, width: '100%', marginBottom: 10 }}
        type="primary"
        onClick={handleContinue}
      >
        Continue
      </Button>
      <Button
        style={{ height: 40, width: '100%' }}
        size="small"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </StyledProjectFormContainer>
  );
};

export default ProjectSelector;
