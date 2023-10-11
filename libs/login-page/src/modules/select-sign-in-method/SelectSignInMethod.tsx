import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Accordion, Button, Colors, Loader } from '@cognite/cogs.js';
import {
  IDPResponse,
  useLoginInfo,
  useValidatedLegacyProjects,
  getLegacyProjectsByCluster,
  KeycloakResponse,
  AADB2CResponse,
  usePublicCogniteIdpOrg,
  getClientId,
  PublicOrgResponse,
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
 * Renders the sign-in buttons, either as a single list of buttons or as a primary button and an
 * accordion with the remaining buttons, depending on whether a Cognite IdP org is provided.
 */
const renderSignInButtons = (
  activePublicCogIdpOrg: PublicOrgResponse | undefined,
  sortedIdps: IDPResponse[]
): JSX.Element => {
  // Note that if `cogIdpOrg` is defined and/or `sortedIdps` is non-empty, then `loginInfo`
  // must have been non-null, and because `loginInfo.domain` is not nullable, `domain` must be
  // non-null in these situations.

  const sortedIdpsWithoutCogIpd = sortedIdps.filter(
    (idp) => idp.type !== 'COGNITE_IDP'
  );

  const otherButtons = (
    <StyledIdpListInner>
      {sortedIdpsWithoutCogIpd.map((idpProps: IDPResponse) =>
        renderSignInButton(idpProps)
      )}
    </StyledIdpListInner>
  );

  if (!activePublicCogIdpOrg) {
    return otherButtons;
  }

  const selectedIdpDetails = getSelectedIdpDetails();
  const isOtherIdpSelected =
    selectedIdpDetails !== undefined &&
    selectedIdpDetails.type !== 'COGNITE_IDP';

  const shouldDisplayOtherIdps =
    isOtherIdpSelected ||
    (sortedIdpsWithoutCogIpd.length > 0 &&
      activePublicCogIdpOrg.migrationStatus === 'DUAL_LOGIN');

  return (
    <>
      <StyledIdpListInner>
        <SignInWithCogniteIdP
          key="cognite-idp"
          organization={activePublicCogIdpOrg.id}
          clientId={getClientId()}
          autoInitiate={!shouldDisplayOtherIdps}
        />
      </StyledIdpListInner>
      {shouldDisplayOtherIdps ? (
        <Accordion
          // When the user selects an non-CogIdP IdP we must take to render the IdP button
          // when they come back from the IdP callback because the button is responsible for
          // finishing the login flow.
          expanded={isOtherIdpSelected}
          hidePadding={true}
          indicatorPlacement="left"
          size="medium"
          title="Other sign in methods"
          type="ghost"
        >
          <StyledIdpDeprecationWarning style={{ textAlign: 'center' }}>
            <span role="img">⚠</span> Options below will be removed soon.
            <br />
            See{' '}
            <a href="https://cognitedata.atlassian.net/wiki/spaces/AUT/pages/4087906504/Migration+of+Internal+Organizations+to+Cognite+Identity+Provider+CogIdP">
              Confluence page
            </a>
            .
          </StyledIdpDeprecationWarning>
          <StyledInstructions>
            If you have problems signing in, please send a message to{' '}
            <StyledSlackHandle>@cog-idp-shield</StyledSlackHandle> on Slack.
          </StyledInstructions>
          <br />
          {otherButtons}
        </Accordion>
      ) : undefined}
    </>
  );
};

/** Renders a single sign-in button, based on the IdP type. */
const renderSignInButton = (
  idpProps: IDPResponse
): JSX.Element | JSX.Element[] => {
  switch (idpProps.type) {
    case 'AZURE_AD':
      return <SignInWithAAD key={idpProps.internalId} {...idpProps} />;
    case 'AAD_B2C':
      return (
        <SignInWithAADB2C
          key={idpProps.internalId}
          {...(idpProps as AADB2CResponse)}
        />
      );
    case 'AUTH0': {
      return <SignInWithAuth0 key={idpProps.internalId} {...idpProps} />;
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
};

/**
 * Sorts the set of IdPs by their label, in alphabetical order, case-insensitive. In addition, it
 * puts Cognite IdPs at the end.
 */
const sortIDPsByLabel = (idps: IDPResponse[]) => {
  const sortedByLabel = idps.sort((idpA: IDPResponse, idpB: IDPResponse) => {
    const idpLabelA = (idpA.label ?? '').toLocaleLowerCase();
    const idpLabelB = (idpB.label ?? '').toLocaleLowerCase();
    if (idpLabelA < idpLabelB) return -1;
    if (idpLabelA > idpLabelB) return 1;
    return 0;
  });
  const nonCogIdPs = sortedByLabel.filter((idp) => idp.type !== 'COGNITE_IDP');
  const cogIdPs = sortedByLabel.filter((idp) => idp.type === 'COGNITE_IDP');
  return [...nonCogIdPs, ...cogIdPs];
};

const SelectSignInMethod = (props: Props): JSX.Element => {
  const { isHelpModalVisible, setIsHelpModalVisible } = props;
  const { t } = useTranslation();

  const {
    data: loginInfo,
    isError: isErrorLoginInfo,
    isFetched: isFetchedLoginInfo,
    error: errorLoginInfo,
  } = useLoginInfo();
  // We timeout after 5s to avoid blocking legacy DLC logins if CogIdP doesn't answer.
  const { data: publicCogIdpOrg, isFetched: isPublicCogIdpOrgFetched } =
    usePublicCogniteIdpOrg({ timeout: 5000 });
  const { data: legacyProjectsByCluster } = useValidatedLegacyProjects(true);
  const { validLegacyProjects = [], invalidLegacyProjects = [] } =
    legacyProjectsByCluster || {};

  const validLegacyProjectsByCluster = useMemo(() => {
    return getLegacyProjectsByCluster(validLegacyProjects);
  }, [validLegacyProjects]);

  const onHelpClick = () =>
    window.open('https://docs.cognite.com/cdf/sign-in.html', '_blank')?.focus();

  const feedbackHandler = () =>
    window
      .open('https://cognite.zendesk.com/hc/en-us/requests/new', '_blank')
      ?.focus();

  if (!isFetchedLoginInfo || !isPublicCogIdpOrgFetched) {
    return <Loader />;
  }

  const activePublicCogIdpOrg =
    publicCogIdpOrg && publicCogIdpOrg.migrationStatus !== 'NOT_STARTED'
      ? publicCogIdpOrg
      : undefined;
  if (isErrorLoginInfo && !activePublicCogIdpOrg) {
    if (errorLoginInfo.statusCode === 404) {
      if (errorLoginInfo.message === 'APPLICATION_NOT_FOUND') {
        return <ApplicationNotFound fullPage />;
      }
      const didYouMean = errorLoginInfo.didYouMean;
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
    return <GenericError error={errorLoginInfo} />;
  }

  const sortedIdps = sortIDPsByLabel(loginInfo?.idps ?? []);

  return (
    <StyledSelectSignInMethodContainer data-testid="login-select-container">
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
        <StyledIdpListOuter>
          {renderSignInButtons(activePublicCogIdpOrg, sortedIdps)}
        </StyledIdpListOuter>

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

const StyledIdpListOuter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .cogs-accordion__header {
    margin: 16px 0 0 0;
    text-align: center;

    .cogs-accordion__header__icon {
      margin-left: 12px;
    }
  }
`;

const StyledIdpListInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledInstructions = styled.div`
  text-align: center;
  margin-top: 16px;
`;

const StyledSlackHandle = styled.code`
  font-family: monospace;
  white-space: nowrap;
`;

const StyledIdpDeprecationWarning = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 187, 0, 0.2);
  background: rgba(255, 187, 0, 0.12);
  margin-bottom: 16px;
`;

const StyledOrganizationLabel = styled.h2`
  text-align: center;
`;

export default SelectSignInMethod;
