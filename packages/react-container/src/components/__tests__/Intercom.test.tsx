import { render, screen } from '@testing-library/react';
import * as intercomPackage from '@cognite/intercom-helper';
import { act } from 'react-dom/test-utils';
import { mockSidecar } from '@cognite/sidecar';

import { IntercomContainer } from '../Intercom';

jest.mock('@cognite/intercom-helper', () => ({
  intercomHelper: {
    boot: jest.fn(),
    identityVerification: jest.fn(),
    shutdown: jest.fn(),
  },
  intercomInitialization: jest.fn().mockImplementation(() => Promise.resolve()),
}));
jest.mock('auth', () => ({
  getAuthHeaders: () => ({ Authorization: 'Bearer test' }),
}));

describe('Intercom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render', async () => {
    const sidecar = mockSidecar();
    const intercomSettings = {
      app_id: 'myId',
      hide_default_launcher: true,
    };

    const Test = () => (
      <IntercomContainer
        intercomSettings={intercomSettings}
        sidecar={sidecar}
        project="project"
      >
        <div>test-content</div>
      </IntercomContainer>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();

    expect(intercomPackage.intercomInitialization).toHaveBeenCalledWith('myId');

    // act lets us better handle promises in useEffect
    // promise lets us wait to the nextTick for the mocked promise to be over
    await act(() => new Promise(process.nextTick));
    expect(intercomPackage.intercomHelper.boot).toHaveBeenCalledWith(
      intercomSettings
    );
    expect(
      intercomPackage.intercomHelper.identityVerification
    ).toHaveBeenCalledWith({
      appsApiUrl: sidecar.appsApiBaseUrl,
      project: 'project',
      headers: {
        Authorization: 'Bearer test',
      },
    });
  });

  it('should not render', () => {
    const sidecar = mockSidecar();

    const Test = () => (
      <IntercomContainer sidecar={sidecar} project="">
        <div>test-content</div>
      </IntercomContainer>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();

    expect(intercomPackage.intercomInitialization).not.toHaveBeenCalled();
    expect(intercomPackage.intercomHelper.boot).not.toHaveBeenCalled();
    expect(
      intercomPackage.intercomHelper.identityVerification
    ).not.toHaveBeenCalled();
  });
});
