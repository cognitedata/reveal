import * as React from 'react';
import { useQuery } from 'react-query';
import { Button, Dropdown, Menu, Loader } from '@cognite/cogs.js';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';

import { StyledProjectFormContainer } from './elements';

interface Props {
  authClient?: CogniteAuth;
  authState?: AuthenticatedUser;
  onSelected: (project: string, cluster: string) => void;
}
const ProjectSelector: React.FC<Props> = ({
  onSelected,
  authClient,
  authState,
}) => {
  const [selectedProject, setSelectedProject] = React.useState<string>();
  const [showMenu, setShowMenu] = React.useState(false);

  const { data = [], isFetched, isError } = useQuery<{ urlName: string }[]>(
    ['projects'],
    async () => {
      const client = authClient?.getClient();

      if (!client) {
        // eslint-disable-next-line no-console
        console.error('Missing SDK client.');
        return [];
      }
      // @ts-expect-error http is private
      client.http.setBearerToken(authState?.token);

      const result = await client.get('/api/v1/projects');
      return result?.data?.items;
    }
  );

  const projects = data.map((d) => ({ urlName: d.urlName, label: d.urlName }));

  // if there is only one
  // then we auto select that for the user
  React.useEffect(() => {
    if (projects.length === 1) {
      setSelectedProject(projects[0].urlName);
    }
  }, [projects]);

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

  if (!isFetched) {
    return <Loader />;
  }

  const showError = isError || !projects || projects.length === 0;

  if (showError) {
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
          variant="outline"
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
        style={{ height: 40, width: '100%' }}
        size="large"
        variant="default"
        type="primary"
        onClick={handleContinue}
      >
        Continue
      </Button>
    </StyledProjectFormContainer>
  );
};

export default ProjectSelector;
