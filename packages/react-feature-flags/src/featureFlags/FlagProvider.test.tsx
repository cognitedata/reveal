import { screen, render } from '@testing-library/react';

import { clientMock } from '../mocks';

import { FlagProvider } from '.';
import { useFlag } from './useFlag';

jest.mock('unleash-proxy-client', () => ({
  UnleashClient: jest.fn().mockImplementation(() => clientMock),
}));

describe('FeatureToggle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const ToggledDiv = () => {
    const { isEnabled } = useFlag('test');
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

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('Should be enabled', () => {
    clientMock.isEnabled.mockReturnValueOnce(true);
    render(RenderedComponent);

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('Should have userId in the context', () => {
    render(
      <FlagProvider appName="not used" apiToken="not used" projectName="daitya">
        <ToggledDiv />
      </FlagProvider>
    );
    expect(clientMock.updateContext).toHaveBeenCalledWith({
      userId: 'daitya',
    });
  });

  it('Should not have remoteAddress in the context', () => {
    render(
      <FlagProvider appName="not used" apiToken="not used" projectName="daitya">
        <ToggledDiv />
      </FlagProvider>
    );
    expect(clientMock.updateContext).toHaveBeenCalledWith({
      userId: 'daitya',
    });
  });

  it('Should not start the client if projectName is undefined', () => {
    render(
      <FlagProvider appName="not used" apiToken="not used">
        <ToggledDiv />
      </FlagProvider>
    );
    expect(clientMock.start).not.toHaveBeenCalled();
    expect(clientMock.updateContext).not.toHaveBeenCalled();
  });
});
