import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import GoToProject from '../../components/select-project/GoToProject';

type SelectProjectsProps = {
  cluster: string;
  error: unknown;
  loading: boolean;
  projects: string[];
};

const SelectProjects = ({
  cluster,
  error,
  loading,
  projects,
}: SelectProjectsProps): JSX.Element => {
  if (error) {
    return (
      <>
        <pre>{JSON.stringify(error)}</pre>
      </>
    );
  }

  if (loading) {
    return <StyledAADProjectsLoadingButton loading />;
  }

  return (
    <StyledAADProjectsContainer>
      {projects.map((projectName) => (
        <GoToProject
          cluster={cluster}
          key={`${cluster}-${projectName}`}
          projectName={projectName}
        />
      ))}
    </StyledAADProjectsContainer>
  );
};

const StyledAADProjectsContainer = styled.div`
  min-height: 40px;
  width: 100%;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const StyledAADProjectsLoadingButton = styled(Button)`
  height: 40px;
  width: 100%;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

export default SelectProjects;
