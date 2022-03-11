import { getFlow, saveFlow } from '@cognite/auth-utils';
import TenantSelector from '@cognite/cdf-hub-tenant-selector';
import { SidecarConfig, CDFClusterSet } from '@cognite/sidecar';

import { useCluster } from '../hooks/useCluster';
import { isProduction } from '../utils';
import { getNewDomain } from '../utils/domain';

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
  const [cluster, setCluster] = useCluster(sidecar);

  const { aadApplicationId, applicationName, availableClusters, fakeIdp } =
    sidecar;

  const handleSubmit = async (selectedProject: string) => {
    // Get the general auth flow. FakeIDP and Azure set it right away
    // so if no auth flow is set until this point we can assume that "COGNITE_AUTH" is the correct fallback
    const { flow, options } = getFlow(selectedProject);

    // then we save the flow for each specific project
    saveFlow(
      flow || 'COGNITE_AUTH',
      {
        cluster,
        directory: options?.directory,
      },
      selectedProject
    );

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
        <div
          style={{
            position: 'absolute',
            bottom: '1%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {fakeIdp
            ?.filter((fakeIdp) => fakeIdp.cluster === cluster)
            .map((fakeIdp) => (
              <LoginWithFakeIDP
                key={fakeIdp.name || fakeIdp.fakeApplicationId}
                handleSubmit={handleSubmit}
                fakeIdpOptions={fakeIdp}
                disabled={fakeIdp.cluster !== cluster}
              />
            ))}
        </div>
      )}
    </>
  );
}
