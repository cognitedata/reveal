import React from 'react';

import { Button } from '@cognite/cogs.js';
import { IDPResponse, useIdpProjects } from '@cognite/login-utils';
import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { Idp } from '@cognite/auth-react';
import styled from 'styled-components';

import ButtonGoToIDPProject from './ButtonGoToIDPProject';
import { useProjects } from '../../../hooks/useProjects';

type IDPProjectListProps = {
  cluster: string;
  idp: IDPResponse | Idp;
};

const IDPProjectList = ({ cluster, idp }: IDPProjectListProps): JSX.Element => {
  // This is the method for fusion.cognite.com, dev.fusion.cogniteapp.com, etc.
  const { data: $projects = [], isFetched: $isFetched } = useIdpProjects(
    cluster,
    idp as IDPResponse,
    {
      enabled: !isUsingUnifiedSignin(),
    }
  );
  // This is the method for apps.cognite.com, app-staging.cognite.com, etc.
  const { data: _projects = [], isFetched: _isFetched } = useProjects(
    cluster,
    idp as Idp
  );
  const projects = isUsingUnifiedSignin() ? _projects : $projects;
  const sortedProjects = projects.sort();

  const isFetched = isUsingUnifiedSignin() ? _isFetched : $isFetched;

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
