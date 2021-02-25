import React from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import '@cognite/auth-utils/jest-mocks';

import { render } from '../utils/test';
import { TenantSelector } from '../TenantSelector';

jest.mock('../components/CardContainer', () => {
  return () => <div>container</div>;
});
jest.mock('@cognite/react-i18n', () => {
  return {
    configureI18n: jest.fn(() => Promise.resolve()),
  };
});
jest.mock('@cognite/cogs.js', () => {
  return {
    Loader: jest.fn(() => <div>Loader</div>),
  };
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
  it('Should show loading by default', async () => {
    render(<TenantSelector {...props} />);

    await waitForElementToBeRemoved(() => screen.queryByText('Loader'));
    await screen.findByText('container');
  });
});
