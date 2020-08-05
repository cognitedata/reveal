import React from 'react';
import { screen, render } from '@testing-library/react';
import { FlagProvider } from '.';
import { useFlag } from './useFlag';
import { clientMock } from '../mocks';

jest.mock('unleash-proxy-client', () => ({
  UnleashClient: jest.fn().mockImplementation(() => {
    return clientMock;
  }),
}));

describe('FeatureToggle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const ToggledDiv = () => {
    const isEnabled = useFlag('test');
    return <div>{isEnabled ? 'enabled' : 'disabled'}</div>;
  };

  const RenderedComponent = (
    <FlagProvider appName="not used" apiToken="not used" projectName="not used">
      <ToggledDiv />
    </FlagProvider>
  );

  it('Should find the correct exports', () => {
    clientMock.isEnabled.mockReturnValueOnce(false);
    render(RenderedComponent);

    expect(screen.getByText('disabled')).toBeDefined();
  });

  it('Should be enabled', () => {
    clientMock.isEnabled.mockReturnValueOnce(true);
    render(RenderedComponent);

    expect(screen.getByText('enabled')).toBeDefined();
  });
});
