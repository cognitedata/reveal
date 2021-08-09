import TenantSelector, { Background } from '@cognite/cdf-hub-tenant-selector';
import { getAzureAppId, useCluster } from 'config';

const clusters = [
  {
    label: 'Multi customer clusters',
    options: [
      {
        value: '',
        label: 'Europe 1 (Google)',
        legacyAuth: true,
      },
      {
        value: 'asia-northeast1-1',
        label: 'Asia 1 (Google)',
        legacyAuth: true,
      },
      { value: 'az-eastus-1', label: 'East US 1 (Azure)' },
      { value: 'westeurope-1', label: 'West Europe 1 (Azure)' },
    ],
  },
  {
    label: 'Single customer clusters',
    options: [
      { value: 'bp', label: 'BP', legacyAuth: true },
      { value: 'bp-northeurope', label: 'BP North Europe (Azure)' },
      { value: 'omv', label: 'OMV', legacyAuth: true },
      { value: 'pgs', label: 'PGS', legacyAuth: true },
      { value: 'power-no', label: 'Power NO', legacyAuth: true },
      { value: 'statnett', label: 'Statnett', legacyAuth: true },
    ],
  },
  {
    label: 'Development clusters',
    options: [
      {
        value: 'greenfield',
        label: 'Greenfield',
        legacyAuth: true,
      },
      {
        value: 'bluefield',
        label: 'Bluefield',
      },
      {
        value: 'azure-dev',
        label: 'Azure Dev',
      },
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
