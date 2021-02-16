import * as React from 'react';
import { Loader } from '@cognite/cogs.js';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';

import { getSidecar } from '../../utils';
import {
  LoginTip,
  TitleChanger,
  CardContainerHeader,
  ProjectSelector,
} from '../../components';
import {
  LoginOrWrapper,
  LoginWithAzure,
  LoginWithAzureAD,
  LoginWithCognite,
} from '../LoginOptions';

import { StyledCardContainer, StyledContentWrapper } from './elements';

export type EnabledModes = {
  cognite?: boolean;
  adfs?: boolean;
  aad?: boolean;
};

export type FormState = {
  [name: string]: {
    value: string;
    error: string;
    isValid: boolean;
  };
};

type Props = {
  handleSubmit: (tenant: string) => void;
  handleClusterSubmit: (tenant: string, cluster: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  validateCluster: (tenant: string, cluster: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  errors?: React.ReactNode[];
  helpLink?: string;
  authClient?: CogniteAuth;
  authState?: AuthenticatedUser;
  enabledLoginModes: EnabledModes;
};

const CardContainer = ({
  authClient,
  handleSubmit,
  handleClusterSubmit,
  validateTenant,
  validateCluster,
  initialTenant,
  loading,
  errors,
  helpLink,
  authState,
  enabledLoginModes = {
    cognite: true,
  },
}: Props) => {
  const [containerHeight, setContainerHeight] = React.useState<string>();
  const container = React.createRef<HTMLDivElement>();
  const { cdfCluster } = getSidecar();

  React.useEffect(() => {
    if (container?.current) {
      if (container.current.clientHeight > 0) {
        setContainerHeight(`${container?.current?.clientHeight}px`);
      }
    }
  }, [container]);

  const showProjectSelection =
    authState && authState?.authenticated && !authState?.project;
  const showLoginOptions = !showProjectSelection;

  // console.log('Render gates', { showProjectSelection, showLoginOptions });
  // console.log('authClient.state', authClient?.state);

  const showLoading = false;

  return (
    <StyledCardContainer style={{ height: `${containerHeight}` }}>
      <div ref={container}>
        <StyledContentWrapper>
          <TitleChanger />
          <CardContainerHeader />

          {showLoading && <Loader />}

          {showProjectSelection && (
            <ProjectSelector
              authState={authState}
              authClient={authClient}
              onSelected={handleSubmit}
            />
          )}

          {showLoginOptions && (
            <>
              {enabledLoginModes.cognite && (
                <LoginWithCognite
                  cluster={cdfCluster}
                  initialTenant={initialTenant}
                  errors={errors}
                  loading={loading}
                  authClient={authClient}
                  handleSubmit={handleSubmit}
                  handleClusterSubmit={handleClusterSubmit}
                  validateTenant={validateTenant}
                  validateCluster={validateCluster}
                />
              )}
              {(enabledLoginModes.aad || enabledLoginModes.adfs) && (
                <LoginOrWrapper />
              )}
              {enabledLoginModes.adfs && (
                <LoginWithAzure authClient={authClient} />
              )}
              {enabledLoginModes.aad && (
                <>
                  {/* Error from AD: */}
                  {authClient?.state.error && (
                    <div>ERROR: {authClient?.state.errorMessage}</div>
                  )}

                  <LoginWithAzureAD
                    authClient={authClient}
                    cluster={cdfCluster}
                  />
                </>
              )}
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
