import TenantSelector, { Background } from '@cognite/cdf-hub-tenant-selector';
import { getAzureAppId, useCluster } from 'config';

const clusters = [
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
      { value: 'power-no', label: 'Power NO', legacyAuth: true },
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

export default function TenantSelectorView() {
  const [cluster, setCluster] = useCluster();

  return (
    <Background>
      <TenantSelector
        appName="Cognite Charts"
        clientId={getAzureAppId()}
        clusters={clusters}
        getCluster={() => cluster}
        updateCluster={(c) => setCluster(c)}
        move={(project: string) => {
          window.location.href = `/${project}${
            cluster ? `?cluster=${cluster}` : ''
          }`;
        }}
      />
    </Background>
  );
}
