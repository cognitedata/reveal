import React from 'react';

import styled from 'styled-components';

import { Colors, Detail } from '@cognite/cogs.js';
import {
  IDPResponse,
  parseEnvLabelFromCluster,
  useIdpProjects,
} from '@cognite/login-utils';

import { useTranslation } from '../../../../i18n';

import IDPProjectList from './IDPProjectList';

type ProjectListByClusterProps = {
  cluster: string;
  idp?: IDPResponse;
  isMultiCluster?: boolean;
};

const ProjectListByCluster = ({
  cluster,
  idp,
  isMultiCluster,
}: ProjectListByClusterProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: idpProjects = [], isFetched: didFetchIdpProjects } =
    useIdpProjects(cluster, idp);

  if (didFetchIdpProjects && !idpProjects.length) {
    return <></>;
  }

  return (
    <StyledProjectListByCluster>
      <StyledProjectListByClusterHeader>
        <StyledTitle>
          {isMultiCluster
            ? parseEnvLabelFromCluster(cluster)
            : t('title-all-projects')}
        </StyledTitle>
      </StyledProjectListByClusterHeader>
      {idp && (
        <IDPProjectList
          cluster={cluster}
          idp={idp}
          key={`${idp.internalId}-${cluster}`}
        />
      )}
    </StyledProjectListByCluster>
  );
};

const StyledProjectListByCluster = styled.div`
  padding: 8px 8px;
  width: 100%;
`;

const StyledProjectListByClusterHeader = styled.div`
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
  margin-bottom: 4px;
`;

const StyledTitle = styled(Detail)`
  color: inherit;
`;

export default ProjectListByCluster;
