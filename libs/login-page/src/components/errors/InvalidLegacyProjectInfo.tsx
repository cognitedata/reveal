import styled from 'styled-components';

import { LegacyProject, parseEnvLabelFromCluster } from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import LoginInfobox from '../login-error-info/LoginInfoError';

type Props = {
  invalidProjects: LegacyProject[];
};

export default function InvalidLegacyProjectInfo({ invalidProjects }: Props) {
  const { t } = useTranslation();
  const infoTitle = t('legacy-projects-not-available-with-count' as any, {
    count: invalidProjects?.length ?? 0,
  });
  const infoMsg = (
    <>
      <p>{t('legacy-projects-not-available')}</p>
      <StyledList>
        {invalidProjects.map((project) => {
          const { cluster, projectName } = project;
          const clusterDisplayName =
            parseEnvLabelFromCluster(cluster).toUpperCase();

          return (
            <StyledListItem key={`${cluster}-${projectName}`}>
              {t('project-in-cluster', {
                projectName,
                clusterDisplayName,
              })}
            </StyledListItem>
          );
        })}
      </StyledList>
      {t('contact-support')}
    </>
  );

  return <LoginInfobox title={infoTitle} message={infoMsg} />;
}

const StyledList = styled.ul`
  margin-top: 2px;
  font-weight: 500;
`;

const StyledListItem = styled.li`
  margin-top: 3;
`;
