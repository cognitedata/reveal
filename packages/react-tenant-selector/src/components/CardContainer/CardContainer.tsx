import * as React from 'react';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';

import {
  ErrorExpandable,
  LoginTip,
  TitleChanger,
  CardContainerHeader,
  ProjectSelector,
} from '../../components';
import {
  LoginOrWrapper,
  LoginWithAzure,
  LoginWithADFS,
  LoginWithCognite,
  LoginWithFakeIDP,
} from '../LoginOptions';
import { SidecarConfig } from '../../utils';

import {
  StyledCardContainer,
  StyledContentWrapper,
  LoginSpacer,
} from './elements';

export type EnabledModes = {
  cognite?: boolean;
  adfs?: boolean;
  aad?: boolean;
  fakeIdp?: SidecarConfig['fakeIdp'];
};

export type FormState = {
  [name: string]: {
    value: string;
    error: string;
    isValid: boolean;
  };
};

type Props = {
  applicationId: string;
  applicationName: string;
  authClient?: CogniteAuth;
  authState?: AuthenticatedUser;
  directory?: string;
  enabledLoginModes: EnabledModes;
  errors?: React.ReactNode[];
  handleClusterSubmit: (tenant: string, cluster: string) => void;
  handleSubmit: (tenant: string) => void;
  helpLink?: string;
  initialCluster?: string;
  initialTenant?: string;
  loading: boolean;
  validateCluster: (tenant: string, cluster: string) => Promise<boolean>;
  validateTenant: (tenant: string) => Promise<boolean>;
};

const CardContainer = ({
  applicationId,
  applicationName,
  authClient,
  authState,
  directory,
  errors,
  handleClusterSubmit,
  handleSubmit,
  helpLink,
  initialTenant,
  initialCluster,
  loading,
  validateCluster,
  validateTenant,
  enabledLoginModes,
}: Props) => {
  const [containerHeight, setContainerHeight] = React.useState<string>();
  const [showProjectSelection, setShowProjectSelection] = React.useState(false);
  const container = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    setShowProjectSelection(authState?.authenticated || false);
  }, [authState?.authenticated]);

  React.useEffect(() => {
    if (container?.current) {
      if (container.current.clientHeight > 0) {
        setContainerHeight(`${container?.current?.clientHeight}px`);
      }
    }
  }, [container, authState?.error, authState?.project]);

  const showLoginOptions = !showProjectSelection;

  const showSpacer =
    !enabledLoginModes.cognite &&
    (enabledLoginModes.aad || enabledLoginModes.adfs);

  const showOr =
    enabledLoginModes.cognite &&
    (enabledLoginModes.aad || enabledLoginModes.adfs);

  // console.log('Render gates', {
  //   showProjectSelection,
  //   showLoginOptions,
  //   showLoading,
  //   showSpacer,
  //   showOr,
  // });

  const ErrorDisplay = () => {
    if (!authState?.error) {
      return null;
    }
    return (
      <ErrorExpandable
        title="There has been an error"
        style={{ marginTop: '30px' }}
      >
        {authState?.errorMessage || ''}
      </ErrorExpandable>
    );
  };

  return (
    <StyledCardContainer style={{ height: `${containerHeight}` }}>
      <div ref={container}>
        <StyledContentWrapper>
          <TitleChanger
            applicationName={applicationName}
            applicationId={applicationId}
          />
          <CardContainerHeader
            applicationName={applicationName}
            applicationId={applicationId}
          />

          <ErrorDisplay />

          <ProjectSelector
            enabled={showProjectSelection}
            authClient={authClient}
            onSelected={handleSubmit}
          />

          {showLoginOptions && (
            <>
              {enabledLoginModes.cognite && (
                <LoginWithCognite
                  initialTenant={initialTenant}
                  initialCluster={initialCluster}
                  errors={errors}
                  loading={loading}
                  authClient={authClient}
                  handleSubmit={handleSubmit}
                  handleClusterSubmit={handleClusterSubmit}
                  validateTenant={validateTenant}
                  validateCluster={validateCluster}
                />
              )}
              {showSpacer && <LoginSpacer />}
              {showOr && <LoginOrWrapper />}
              {enabledLoginModes.adfs && (
                <LoginWithADFS authClient={authClient} />
              )}
              {enabledLoginModes.aad && (
                <LoginWithAzure authClient={authClient} directory={directory} />
              )}
              {enabledLoginModes.fakeIdp?.map((fakeIdp) => (
                <LoginWithFakeIDP
                  key={fakeIdp.name || fakeIdp.fakeApplicationId}
                  handleSubmit={handleSubmit}
                  authClient={authClient}
                  disabled={fakeIdp.cluster !== authClient?.getCluster()}
                  {...fakeIdp}
                />
              ))}
            </>
          )}
        </StyledContentWrapper>
        {/* Can we provide a better default link? */}
        <LoginTip helpLink={helpLink || 'https://docs.cognite.com/'} />
      </div>
    </StyledCardContainer>
  );
};

export default CardContainer;
