import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import styled from 'styled-components';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Icon } from '@cognite/cogs.js';
import {
  getLoginFlowsByCluster,
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useIdp,
  useLoginInfo,
  useValidatedLegacyProjects,
  useIdpProjectsFromAllClusters,
  AADError,
  usePca,
  cogIdpInternalId,
  usePublicCogniteIdpOrg,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import {
  StyledContent,
  StyledFooter,
  StyledContainerHeader,
  StyledSelectSignInMethodContainer,
} from '../../components/containers';
import ApplicationNotFound from '../../components/errors/ApplicationNotFound';
import InvalidLegacyProjectInfo from '../../components/errors/InvalidLegacyProjectInfo';
import ProjectList from '../../components/project-list/ProjectList';

import AADLogoutButton from './AADLogoutButton';
import ADFS2016LogoutButton from './ADFSLogoutButton';
import Auth0LogoutButton from './Auth0LogoutButton';
import CogIdpLogoutButton from './CogIdpLogoutButton';
import KeycloakLogoutButton from './KeycloakLogoutButton';
import Welcome from './Welcome';

const SelectProject = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: loginInfo, isFetched: isFetchedLoginInfo } = useLoginInfo();
  const { internalId } =
    getSelectedIdpDetails() ??
    (loginInfo?.idps.length === 1 ? loginInfo.idps[0] : {});

  const { data: idp, isFetched: isFetchedIdp } = useIdp(internalId);
  const pca = usePca(idp?.appConfiguration.clientId, idp?.authority);

  const { data: legacyProjectsByCluster } = useValidatedLegacyProjects(true);
  const { invalidLegacyProjects = [], validLegacyProjects = [] } =
    legacyProjectsByCluster || {};

  const loginFlowsByCluster = useMemo(() => {
    return getLoginFlowsByCluster(loginInfo, idp, validLegacyProjects);
  }, [idp, loginInfo, validLegacyProjects]);

  const projectsFromAllClusters = useIdpProjectsFromAllClusters(
    Object.keys(loginFlowsByCluster),
    idp,
    { enabled: !!idp }
  );

  // Track adoption of CogIdP.
  // We are interested in three things:
  //   1. Is the user's organization registered in CogIdP? (cogIdpMigrationStatus != NOT_IN_COG_IDP)
  //   -> If so:
  //   -> 2. What is the migration status of the user's organization? (cogIdpMigrationStatus)
  //   -> 3. Is the user logged in with CogIdP? (isUsingCogIdp)
  const { data: publicCogIdpOrg, isFetched: isPublicCogIdpOrgFetched } =
    usePublicCogniteIdpOrg({ timeout: 30000 });
  useEffect(() => {
    if (isPublicCogIdpOrgFetched) {
      const cogIdpMigrationStatus =
        publicCogIdpOrg?.migrationStatus || 'NOT_IN_COG_IDP';
      const isUsingCogIdp = internalId === cogIdpInternalId;
      trackEvent('SelectProjectPageView', {
        cogIdpMigrationStatus,
        isUsingCogIdp,
      });
    }
  }, [internalId, publicCogIdpOrg, isPublicCogIdpOrgFetched]);

  useEffect(() => {
    if (
      projectsFromAllClusters.length > 0 &&
      projectsFromAllClusters.every(
        ({ error }) =>
          !!error && (error as any)?.subError !== 'consent_required'
      )
    ) {
      if (pca) {
        const activeAccount = pca.getActiveAccount();
        pca.logout({
          account: activeAccount || undefined,
          onRedirectNavigate: () => {
            // By returning false, we skip the redirect to microsoft logout page
            // because we don't want user to be actually logged out from the idp.
            // Instead, we want @azure/msal-browser do the clean-up on local
            // storage and session storage.
            return false;
          },
        });
        pca.setActiveAccount(null);
      }
      removeSelectedIdpDetails();
      navigate('/');
    }
  }, [navigate, pca, projectsFromAllClusters]);

  useEffect(() => {
    if (!internalId) {
      // If we cannot find the selected login flow id in local storage, we
      // redirect to `/` route.
      navigate('/');
    } else if (isFetchedIdp && !idp) {
      // If the selected login flow id id doesn't match with any of the idps,
      // we redirect to `/` route after cleaning up the entry in local storage.
      removeSelectedIdpDetails();
      navigate('/');
    }
  }, [idp, isFetchedIdp, navigate, internalId]);

  if (!isFetchedLoginInfo || !isFetchedIdp) {
    return <Icon type="Loader" />;
  }

  const hasNoLegacyProjects = Object.values(loginFlowsByCluster).every(
    ({ legacyProjects }) => !legacyProjects.length
  );
  const hasNoAzureProjects =
    idp?.type === 'AZURE_AD' &&
    projectsFromAllClusters.every(
      ({ isFetched, error, data }) =>
        isFetched && !(error as AADError)?.errorMessage && !data?.length
    );

  const hasNoOtherProjects =
    idp?.type !== 'AZURE_AD' &&
    projectsFromAllClusters.every(
      ({ isFetched, error, data }) => isFetched && !error && !data?.length
    );

  return (
    <StyledContainer>
      <StyledContainerHeader>
        {idp && <Welcome idp={idp} />}
        <StyledDescription>{t('select-project')}</StyledDescription>
      </StyledContainerHeader>
      <StyledContent $isBordered>
        {hasNoLegacyProjects &&
        (!idp || hasNoAzureProjects || hasNoOtherProjects) ? (
          <ApplicationNotFound />
        ) : (
          <>
            {Object.keys(loginFlowsByCluster).map((cluster, clusterIndex) => (
              <ProjectList
                cluster={cluster}
                key={cluster}
                idp={loginFlowsByCluster[cluster].idp}
                idpProjects={
                  projectsFromAllClusters[clusterIndex].data as string[]
                }
                idpProjectsError={projectsFromAllClusters[clusterIndex].error}
                idpProjectsIsFetched={
                  projectsFromAllClusters[clusterIndex].isFetched
                }
                isMultiCluster={Object.keys(loginFlowsByCluster).length > 1}
                isSignInRequiredLabelShown
                legacyProjects={loginFlowsByCluster[cluster].legacyProjects}
              />
            ))}
            {invalidLegacyProjects?.length ? (
              <InvalidLegacyProjectInfo
                invalidProjects={invalidLegacyProjects}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </StyledContent>
      <StyledFooter>
        {(idp?.type === 'AZURE_AD' || idp?.type === 'AAD_B2C') && (
          <AADLogoutButton />
        )}
        {idp?.type === 'AUTH0' && <Auth0LogoutButton />}
        {idp?.type === 'ADFS2016' && <ADFS2016LogoutButton />}
        {idp?.type === 'KEYCLOAK' && <KeycloakLogoutButton />}
        {idp?.type === 'COGNITE_IDP' && <CogIdpLogoutButton />}
      </StyledFooter>
    </StyledContainer>
  );
};

const StyledContainer = styled(StyledSelectSignInMethodContainer)`
  padding-top: 0;
`;

const StyledDescription = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
`;

export default SelectProject;
