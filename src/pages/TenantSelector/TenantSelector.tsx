import TenantSelector, { Background } from '@cognite/cdf-hub-tenant-selector';
import { useCluster } from 'hooks/config';
import Config from 'models/charts/config/classes/Config';
import { isProduction } from 'models/charts/config/utils/environment';

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

export default function TenantSelectorView() {
  const [cluster, setCluster] = useCluster();

  return (
    <Background>
      <TenantSelector
        appName={Config.appName}
        clientId={Config.azureAppId}
        clusters={clusters}
        cluster={cluster || ''}
        setCluster={setCluster}
        move={(project: string) => {
          window.location.href = `/${project}${
            cluster ? `?cluster=${cluster}` : ''
          }`;
        }}
        isProduction={isProduction}
      />
    </Background>
  );
}
