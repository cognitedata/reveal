import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Button, Colors, Loader } from '@cognite/cogs.js';
import {
  IDPResponse,
  useLoginInfo,
  useValidatedLegacyProjects,
  getLegacyProjectsByCluster,
  KeycloakResponse,
  CogniteIdPResponse,
  AADB2CResponse,
  getSelectedIdpDetails,
} from '@cognite/login-utils';

import CogniteDataFusionSvg from '../../assets/CogniteDataFusion.svg';
import { useTranslation } from '../../common/i18n';
import {
  StyledApplicationImage,
  StyledApplicationTitle,
  StyledContainerHeader,
  StyledContent,
  StyledFooter,
  StyledOrganizationImage,
  StyledSelectSignInMethodContainer,
} from '../../components/containers';
import ApplicationNotFound from '../../components/errors/ApplicationNotFound';
import DomainNotFound from '../../components/errors/DomainNotFound';
import GenericError from '../../components/errors/GenericError';
import InvalidLegacyProjectInfo from '../../components/errors/InvalidLegacyProjectInfo';
import LoginHelp from '../../components/login-help';
import ProjectList from '../../components/project-list/ProjectList';
import SignInWithAAD from '../../components/select-sign-in-method/SignInWithAAD';
import SignInWithAADB2C from '../../components/select-sign-in-method/SignInWithAADB2C';
import SignInWithADFS2016 from '../../components/select-sign-in-method/SignInWithADFS2016';
import SignInWithAuth0 from '../../components/select-sign-in-method/SignInWithAuth0';
import SignInWithCogniteIdP from '../../components/select-sign-in-method/SignInWithCogIdP';
import SignInWithKeycloak from '../../components/select-sign-in-method/SignInWithKeycloak';
import { getRootDomain, redirectToSelectDomainPage } from '../../utils';

type Props = {
  isHelpModalVisible: boolean;
  setIsHelpModalVisible: (visible: boolean) => void;
};

/**
 * This method was originally defined in the package @cognite/login-utils
 * But it doesn't make sense to have the code stored in a separate package,
 * only used by this file.
 * This sorts the set of IdPs by their label, in alphabetical order, case-insensitive.
 * In addition, it puts Cognite IdPs at the end.
 */
const sortIDPsByLabel = (idps?: IDPResponse[]) => {
  const sortedByLabel = (idps ?? []).sort(
    (idpA: IDPResponse, idpB: IDPResponse) => {
      const idpLabelA = (idpA.label ?? '').toLocaleLowerCase();
      const idpLabelB = (idpB.label ?? '').toLocaleLowerCase();
      if (idpLabelA < idpLabelB) return -1;
      if (idpLabelA > idpLabelB) return 1;
      return 0;
    }
  );
  const nonCogIdPs = sortedByLabel.filter((idp) => idp.type !== 'COGNITE_IDP');
  const cogIdPs = sortedByLabel.filter((idp) => idp.type === 'COGNITE_IDP');
  return [...nonCogIdPs, ...cogIdPs];
};

const SelectSignInMethod = (props: Props): JSX.Element => {
  const { isHelpModalVisible, setIsHelpModalVisible } = props;
  const { t } = useTranslation();

  const { internalId: selectedInternalId } = getSelectedIdpDetails() ?? {};

  const { data: loginInfo, isError, isFetched, error } = useLoginInfo();
  const { data: legacyProjectsByCluster } = useValidatedLegacyProjects(true);
  const { validLegacyProjects = [], invalidLegacyProjects = [] } =
    legacyProjectsByCluster || {};

  const validLegacyProjectsByCluster = useMemo(() => {
    return getLegacyProjectsByCluster(validLegacyProjects);
  }, [validLegacyProjects]);

  const sortedIdps = sortIDPsByLabel(loginInfo?.idps);

  const onHelpClick = () =>
    window.open('https://docs.cognite.com/cdf/sign-in.html', '_blank')?.focus();

  const feedbackHandler = () =>
    window
      .open('https://cognite.zendesk.com/hc/en-us/requests/new', '_blank')
      ?.focus();

  if (!isFetched) {
    return <Loader />;
  }

  if (isError) {
    if (error.statusCode === 404) {
      if (error.message === 'APPLICATION_NOT_FOUND') {
        return <ApplicationNotFound fullPage />;
      }
      const didYouMean = error.didYouMean;
      const fullDidYouMean = didYouMean?.map(
        (domain) => `${domain}.${getRootDomain()}`
      );
      return (
        <DomainNotFound
          didYouMean={fullDidYouMean}
          isDomainHelpModalVisible={isHelpModalVisible}
          whatsMyDomain={setIsHelpModalVisible}
          openHelpDocs={onHelpClick}
          openChat={feedbackHandler}
        />
      );
    }
    return <GenericError error={error} />;
  }

  const isCogIdpPresent = !!sortedIdps.find(
    (idp) => idp.type === 'COGNITE_IDP'
  );

  return (
    <StyledSelectSignInMethodContainer>
      <StyledContainerHeader>
        {loginInfo?.imageRectangle && (
          <StyledOrganizationImage
            alt="organization logo"
            src={`data:${loginInfo.imageRectangle.imageType};base64, ${loginInfo.imageRectangle.imageData}`}
          />
        )}
        {loginInfo?.imageSquare && !loginInfo?.imageRectangle && (
          <StyledOrganizationImage
            alt="organization logo"
            src={`data:${loginInfo.imageSquare.imageType};base64, ${loginInfo.imageSquare.imageData}`}
          />
        )}
        {!loginInfo?.imageRectangle &&
          !loginInfo?.imageSquare &&
          loginInfo?.label && (
            <StyledOrganizationLabel>
              {loginInfo?.label}
            </StyledOrganizationLabel>
          )}
        <StyledApplicationTitle>
          {t('sign-in-to_uppercase')}
        </StyledApplicationTitle>
        <StyledApplicationImage
          alt="application logo"
          src={CogniteDataFusionSvg}
        />
      </StyledContainerHeader>
      <StyledContent $isBordered>
        {loginInfo?.idps ? (
          <StyledIdpListContainer>
            {sortedIdps.map((idpProps: IDPResponse) => {
              switch (idpProps.type) {
                case 'AZURE_AD':
                  return (
                    <SignInWithAAD
                      key={idpProps.internalId}
                      {...idpProps}
                      trySSO={
                        !isCogIdpPresent &&
                        sortedIdps.filter(({ type }) => type === 'AZURE_AD')
                          .length === 1 &&
                        !selectedInternalId
                      }
                    />
                  );
                case 'AAD_B2C':
                  return (
                    <SignInWithAADB2C
                      key={idpProps.internalId}
                      {...(idpProps as AADB2CResponse)}
                    />
                  );
                case 'AUTH0': {
                  return (
                    <SignInWithAuth0 key={idpProps.internalId} {...idpProps} />
                  );
                }
                case 'KEYCLOAK': {
                  const keycloakProps = idpProps as KeycloakResponse;
                  return keycloakProps.realm ? (
                    keycloakProps.clusters.map((cluster) => (
                      <SignInWithKeycloak
                        key={keycloakProps.internalId}
                        cluster={cluster}
                        {...keycloakProps}
                      />
                    ))
                  ) : (
                    <SignInWithKeycloak
                      key={keycloakProps.internalId}
                      cluster="none"
                      {...keycloakProps}
                    />
                  );
                }
                case 'COGNITE_IDP': {
                  return (
                    <SignInWithCogniteIdP
                      organization={loginInfo.domain}
                      key={idpProps.internalId}
                      {...(idpProps as CogniteIdPResponse)}
                    />
                  );
                }
                case 'ADFS2016': {
                  return idpProps.clusters.map((cluster: string) => {
                    return (
                      <SignInWithADFS2016
                        authority={idpProps.authority}
                        clientId={idpProps.appConfiguration.clientId}
                        cluster={cluster}
                        internalId={idpProps.internalId}
                        label={idpProps.label}
                        key={idpProps.internalId}
                      />
                    );
                  });
                }
                default:
                  return <></>;
              }
            })}
          </StyledIdpListContainer>
        ) : (
          <></>
        )}
        {loginInfo?.idps?.length && loginInfo?.legacyProjects?.length ? (
          <StyledDividerContainer>
            <StyledDivider />
            {t('or')}
            <StyledDivider />
          </StyledDividerContainer>
        ) : (
          <></>
        )}
        {Object.keys(validLegacyProjectsByCluster)?.map((cluster) => (
          <ProjectList
            cluster={cluster}
            isMultiCluster={
              Object.keys(validLegacyProjectsByCluster).length > 1
            }
            legacyProjects={validLegacyProjectsByCluster[cluster]}
            key={cluster}
          />
        ))}
        {invalidLegacyProjects?.length ? (
          <InvalidLegacyProjectInfo invalidProjects={invalidLegacyProjects} />
        ) : (
          <></>
        )}
      </StyledContent>
      <StyledFooter>
        <Button
          icon="Login"
          iconPlacement="right"
          onClick={redirectToSelectDomainPage}
          type="ghost-accent"
        >
          {t('sign-in-other-domain')}
        </Button>
        <LoginHelp onClickDocs={onHelpClick} onClickChat={feedbackHandler} />
      </StyledFooter>
    </StyledSelectSignInMethodContainer>
  );
};

const StyledDividerContainer = styled.div`
  align-items: center;
  color: ${Colors['text-icon--muted']};
  display: flex;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin: 24px 0;
  width: 100%;
`;

const StyledDivider = styled.div`
  background-color: ${Colors['border--muted']};
  flex: 1;
  height: 1px;

  :first-child {
    margin-right: 12px;
  }

  :last-child {
    margin-left: 12px;
  }
`;

const StyledIdpListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledOrganizationLabel = styled.h2`
  text-align: center;
`;

export default SelectSignInMethod;
