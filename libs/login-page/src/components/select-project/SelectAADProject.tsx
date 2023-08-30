import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { AADError, IDPResponse, usePca } from '@cognite/login-utils';

import GoToAADProject from '../../components/select-project/GoToProject';

import AADErrorFeedback from './AADErrorFeedback';

type SelectProjectsProps = {
  cluster: string;
  error: AADError | null;
  idp: IDPResponse;
  loading: boolean;
  projects: string[];
};

const SelectAADProjects = ({
  cluster,
  error,
  idp,
  loading,
  projects,
}: SelectProjectsProps): JSX.Element => {
  const pca = usePca(idp.appConfiguration.clientId, idp.authority);
  const sortedProjects = projects.sort();

  if (error && pca && error.errorCode && error.errorMessage) {
    return (
      <AADErrorFeedback
        idp={idp}
        cluster={cluster}
        errorCode={error.errorCode}
        errorMessage={error.errorMessage}
      />
    );
  }

  if (loading) {
    return <StyledAADProjectsLoadingButton loading />;
  }

  return (
    <StyledAADProjectsContainer>
      {sortedProjects.map((projectName) => (
        <GoToAADProject
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

export default SelectAADProjects;
