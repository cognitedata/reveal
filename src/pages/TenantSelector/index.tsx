import React from 'react';
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
    ],
  },
  {
    label: 'Single customer clusters',
    options: [
      { value: 'bp', label: 'BP', legacyAuth: true },
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
