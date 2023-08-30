import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { IDPResponse, useIdpProjects } from '@cognite/login-utils';

import ButtonGoToIDPProject from './ButtonGoToIDPProject';

type IDPProjectListProps = {
  cluster: string;
  idp: IDPResponse;
};

const IDPProjectList = ({ cluster, idp }: IDPProjectListProps): JSX.Element => {
  const { data: projects = [], isFetched } = useIdpProjects(cluster, idp);
  const sortedProjects = projects.sort();

  if (!isFetched) {
    return <StyledIDPProjectsLoadingButton loading />;
  }

  return (
    <StyledIDPProjectsContainer>
      {sortedProjects.map((projectName) => (
        <ButtonGoToIDPProject
          cluster={cluster}
          key={`${cluster}-${projectName}`}
          projectName={projectName}
        />
      ))}
    </StyledIDPProjectsContainer>
  );
};

const StyledIDPProjectsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledIDPProjectsLoadingButton = styled(Button)`
  width: 100%;
`;

export default IDPProjectList;
