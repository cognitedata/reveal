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
      { value: 'westeurope-1', label: 'Europe 2 (Microsoft)' },
    ],
  },
  {
    label: 'Single customer clusters',
    options: [
      {
        value: 'omv',
        label: 'OMV',
        oidc: true,
        legacyAuth: true,
      },
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
