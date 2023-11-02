import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';
import {
  parseEnvLabelFromCluster,
  IDPResponse,
  AADError,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import SelectAADProjects from '../../components/select-project/SelectAADProject';
import SelectProjects from '../../components/select-project/SelectProject';

type ProjectListProps = {
  cluster: string;
  idp?: IDPResponse;
  /*
   * NOTE
   * The following 3 props were retrieved using a hook before, but it causes an infinite loop.
   * I'm not exactly sure why or how that is, but removing the hook, and getting them from parent, which already has it, fixes it.
   */
  idpProjects?: string[];
  idpProjectsError?: unknown;
  idpProjectsIsFetched?: boolean;
  isMultiCluster?: boolean;
  isSignInRequiredLabelShown?: boolean;
};

const ProjectList = ({
  cluster,
  idp,
  idpProjects,
  idpProjectsError,
  idpProjectsIsFetched,
  isMultiCluster,
}: ProjectListProps): JSX.Element => {
  const { t } = useTranslation();

  if (
    !idp ||
    (idp.type !== 'AZURE_AD' &&
      idpProjectsIsFetched &&
      !idpProjectsError &&
      !idpProjects?.length) ||
    (idp.type === 'AZURE_AD' &&
      idpProjectsIsFetched &&
      !(idpProjectsError as AADError)?.errorMessage &&
      !idpProjects?.length)
  ) {
    return <></>;
  }

  // Gandalf responds with 401 if the user does not have access to any projects in this cluster.
  if (
    !!idpProjectsError &&
    typeof idpProjectsError === 'object' &&
    'status' in idpProjectsError &&
    idpProjectsError.status === 401 &&
    idp &&
    idp.type === 'COGNITE_IDP'
  ) {
    return <></>;
  }

  return (
    <StyledProjectList>
      <StyledProjectListHeader>
        <StyledTitle>
          {isMultiCluster
            ? parseEnvLabelFromCluster(cluster).toUpperCase()
            : t('all-projects_uppercase')}
        </StyledTitle>
      </StyledProjectListHeader>
      {idp && idp.type !== 'AZURE_AD' && (
        <SelectProjects
          cluster={cluster}
          error={idpProjectsError}
          key={`${idp.internalId}-${cluster}`}
          loading={!idpProjectsIsFetched}
          projects={idpProjects ?? []}
        />
      )}
      {idp?.type === 'AZURE_AD' && (
        <SelectAADProjects
          cluster={cluster}
          error={idpProjectsError as AADError}
          idp={idp}
          key={`${idp.internalId}-${cluster}`}
          loading={!idpProjectsIsFetched}
          projects={idpProjects ?? []}
        />
      )}
    </StyledProjectList>
  );
};

const StyledProjectList = styled.div`
  width: 100%;

  :not(:last-child) {
    border-bottom: 1px solid ${Colors['border--muted']};
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
`;

const StyledProjectListHeader = styled.div`
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
  margin-bottom: 4px;
`;

const StyledTitle = styled.div`
  flex: 1;
  font-feature-settings: 'cv05';
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
`;

export default ProjectList;
