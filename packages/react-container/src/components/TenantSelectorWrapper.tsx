import TenantSelector from '@cognite/cdf-hub-tenant-selector';
import {
  SidecarConfig,
  CDFClusterSet,
  getDefaultSidecar,
  CDFCluster,
} from '@cognite/sidecar';
import { memo, useEffect, useState } from 'react';
import { AuthenticatedUser, CogniteAuth, getFlow } from '@cognite/auth-utils';
import { ErrorExpandable } from '@cognite/react-errors';
import { removeItem } from '@cognite/storage';

import { useCogniteSDKClient } from '../internal';
import { getNewDomain } from '../utils/domain';
import { isProduction } from '../utils';
import { useCluster } from '../hooks/useCluster';

import LoginWithFakeIDP from './LoginWithFakeIDP';

const defaultClusters: CDFClusterSet[] = [
  {
    label: 'Multi customer environments',
    options: [
      { value: '', label: 'Europe 1 (Google)', legacyAuth: true },
      { value: 'westeurope-1', label: 'Europe 2 (Microsoft)' },
      { value: 'asia-northeast1-1', label: 'Asia 1', legacyAuth: true },
      { value: 'az-eastus-1', label: 'US East 1' },
    ],
  },
  {
    label: 'Single customer environments',
    options: [
      { value: 'bp-northeurope', label: 'BP North Europe' },
      { value: 'omv', label: 'OMV', legacyAuth: true },
      { value: 'pgs', label: 'PGS', legacyAuth: true },
      { value: 'power-no', label: 'Power NO (Google)', legacyAuth: true },
      { value: 'az-power-no-northeurope', label: 'Power NO (Microsoft)' },
      { value: 'statnett', label: 'Statnett', legacyAuth: true },
    ],
  },
  {
    label: 'Staging environments',
    options: [
      { value: 'greenfield', label: 'greenfield', legacyAuth: true },
      { value: 'bluefield', label: 'bluefield' },
      { value: 'azure-dev', label: 'azure-dev' },
    ],
  },
];

type Props = {
  sidecar: SidecarConfig;
};

export function TenantSelectorWrapper({ sidecar }: Props) {
  const [authState, setAuthState] = useState<AuthenticatedUser | undefined>();
  const [authClient, setAuthClient] = useState<CogniteAuth | undefined>();
  const [cluster, setCluster] = useCluster(sidecar);

  const {
    aadApplicationId,
    applicationName,
    availableClusters,
    applicationId,
    directoryTenantId,
    fakeIdp,
  } = sidecar;

  const { cdfApiBaseUrl } = getDefaultSidecar({
    prod: isProduction,
    cluster: cluster as CDFCluster,
  });

  const { flow, options } = getFlow();

  const sdkClient = useCogniteSDKClient(applicationId, {
    baseUrl: cdfApiBaseUrl,
  });

  const doSetup = async () => {
    removeItem('@cognite/sdk:accountLocalId');

    const cogniteAuth = new CogniteAuth(sdkClient, {
      aad: aadApplicationId
        ? {
            appId: aadApplicationId,
            directoryTenantId: options?.directory || directoryTenantId,
          }
        : undefined,
      appName: applicationId,
      cluster,
      flow,
    });

    const unsubscribe = cogniteAuth.onAuthChanged(
      applicationId,
      (user: AuthenticatedUser) => {
        if (user) {
          setAuthState(user);
        }
      }
    );

    setAuthClient(cogniteAuth);
    return unsubscribe;
  };

  useEffect(() => {
    const callbacks = doSetup();

    return () => {
      callbacks.then((action) => {
        action();
      });
    };
  }, [sidecar, flow, cluster]);

  const handleSubmit = async (selectedProject: string) => {
    const { hash, search, hostname } = window.location;
    const url = [
      `//${getNewDomain(hostname, cluster)}/${selectedProject}`,
      search,
      hash,
    ]
      .filter(Boolean)
      .join('');
    window.location.href = url;
  };

  const ErrorDisplay = memo(() => {
    if (!authState?.error || !authState?.errorMessage) {
      return null;
    }

    return (
      <ErrorExpandable
        title="There has been an error"
        style={{ marginTop: '30px' }}
      >
        {authState?.errorMessage}
      </ErrorExpandable>
    );
  });

  return (
    <>
      <TenantSelector
        appName={applicationName}
        clientId={aadApplicationId || ''}
        clusters={availableClusters || defaultClusters}
        cluster={cluster}
        setCluster={setCluster}
        move={handleSubmit}
        isProduction={isProduction}
      />
      {fakeIdp && (
        <>
          {flow === 'FAKE_IDP' && <ErrorDisplay />}
          <div style={{ position: 'absolute', bottom: '1%', left: '42%' }}>
            {fakeIdp
              ?.filter((fakeIdp) => fakeIdp.cluster === cluster)
              .map((fakeIdp) => (
                <LoginWithFakeIDP
                  key={fakeIdp.name || fakeIdp.fakeApplicationId}
                  handleSubmit={handleSubmit}
                  fakeIdpOptions={fakeIdp}
                  authClient={authClient}
                  disabled={fakeIdp.cluster !== cluster}
                />
              ))}
          </div>
        </>
      )}
    </>
  );
}
