import React from 'react';
import { screen } from '@testing-library/react';
import '@cognite/auth-utils/jest-mocks';

import { render } from '../utils/test';
import { TenantSelector } from '../TenantSelector';

jest.mock('../components/CardContainer', () => {
  return () => <div>test-container</div>;
});

const props = {
  sidecar: {
    __sidecarFormatVersion: 1,
    aadApplicationId: '123',
    applicationId: '',
    applicationName: '',
    appsApiBaseUrl: '',
    cdfCluster: '',
    cdfApiBaseUrl: '',
    directoryTenantId: '',
  },
};

describe('<TenantSelector />', () => {
  it('Should show container content', async () => {
    render(<TenantSelector {...props} />);

    await screen.findByText('test-container');
  });
});
