import * as React from 'react';
import { Loader } from '@cognite/cogs.js';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';

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

import { StyledCardContainer, StyledContentWrapper, Error } from './elements';

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
  applicationId: string;
  applicationName: string;
  authClient?: CogniteAuth;
  authState?: AuthenticatedUser;
  cdfCluster: string;
  enabledLoginModes: EnabledModes;
  errors?: React.ReactNode[];
  handleClusterSubmit: (tenant: string, cluster: string) => void;
  handleSubmit: (tenant: string) => void;
  helpLink?: string;
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
  cdfCluster,
  errors,
  handleClusterSubmit,
  handleSubmit,
  helpLink,
  initialTenant,
  loading,
  validateCluster,
  validateTenant,
  enabledLoginModes,
}: Props) => {
  const [containerHeight, setContainerHeight] = React.useState<string>();
  const container = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    if (container?.current) {
      if (container.current.clientHeight > 0) {
        setContainerHeight(`${container?.current?.clientHeight}px`);
      }
    }
  }, [container, authState?.error, authState?.project]);

  const showLoading =
    authClient?.state.initialized && (!authState || authState?.initialising);

  const showProjectSelection = !showLoading && authState?.authenticated;

  const showLoginOptions = !showProjectSelection && !showLoading;

  // console.log('Render gates', {
  //   showProjectSelection,
  //   showLoginOptions,
  //   showLoading,
  // });

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
                  {authState?.error && (
                    <Error>
                      <strong>ERROR: </strong>
                      {authState?.errorMessage}
                    </Error>
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
        {!showLoading && (
          <LoginTip helpLink={helpLink || 'https://docs.cognite.com/'} />
        )}
      </div>
    </StyledCardContainer>
  );
};

export default CardContainer;
