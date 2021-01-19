import * as React from 'react';
import { Button, Dropdown, Icons, Menu } from '@cognite/cogs.js';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';

import { getSidecar } from '../../utils';
import { getClusterFromCdfApiBaseUrl } from '../../utils/cluster';
import { LoginTip, TitleChanger, CardContainerHeader } from '../../components';
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

  React.useEffect(() => {
    if (container?.current) {
      if (container.current.clientHeight > 0) {
        setContainerHeight(`${container?.current?.clientHeight}px`);
      }
    }
  }, [container]);

  const { cdfApiBaseUrl } = getSidecar();
  const deploymentCluster = `${getClusterFromCdfApiBaseUrl(cdfApiBaseUrl)}`;

  return (
    <StyledCardContainer style={{ height: `${containerHeight}` }}>
      <div ref={container}>
        <StyledContentWrapper>
          <TitleChanger />
          <CardContainerHeader />

          {/* testing error from AD: */}
          {authClient?.state.error && <div>ERROR</div>}

          {authState?.availableProjects && (
            <ProjectAndClusterSelectorForm
              authClient={authClient}
              onSelected={(project) => handleSubmit(project)}
              projects={
                authState.availableProjects || []
                // { urlName: 'react-demo-app-bluefield', cluster: 'bluefield' },
              }
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              selectedTenantId={authState.tenantId}
            />
          )}
          {!authState && (
            <>
              {enabledLoginModes.cognite && (
                <LoginWithCognite
                  cluster={deploymentCluster}
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
                <LoginWithAzureAD
                  authClient={authClient}
                  cluster={deploymentCluster}
                />
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

const ProjectAndClusterSelectorForm = ({
  onSelected,
  projects,
  authClient,
}: {
  projects: { urlName: string; cluster?: string }[];
  authClient?: CogniteAuth;
  onSelected: (project: string, cluster: string) => void;
}) => {
  const [selectedProject, setSelectedProject] = React.useState<string>();
  React.useEffect(() => {
    if (projects.length === 1) {
      setSelectedProject(projects[0].urlName);
    }
  }, [projects]);

  const ProjectsContent = (
    <Menu>
      {projects.map((dir) => (
        <Menu.Item
          onClick={() => setSelectedProject(dir.urlName)}
          key={dir.urlName}
        >
          {dir.urlName}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <div>
      <p style={{ color: '#404040', fontWeight: 600, fontSize: 13 }}>
        Project <Icons.Help />{' '}
      </p>
      <Dropdown content={ProjectsContent}>
        <Button
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}
          disabled={projects.length === 1}
          variant="outline"
          icon="Down"
          iconPlacement="right"
        >
          {selectedProject || 'Select project'}
        </Button>
      </Dropdown>
      <br />
      <Button
        style={{ marginTop: 30, height: 40, width: '100%' }}
        size="large"
        variant="default"
        type="primary"
        onClick={() => {
          if (authClient && selectedProject) {
            authClient.selectProject(selectedProject);
            onSelected(
              selectedProject,
              projects.find((p) => p.urlName === selectedProject)?.cluster ||
                'api'
            );
          }
        }}
      >
        Continue
      </Button>
    </div>
  );
};

export default CardContainer;
