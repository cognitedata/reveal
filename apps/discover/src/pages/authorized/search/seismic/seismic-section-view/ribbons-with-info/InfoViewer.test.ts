import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { InfoViewer } from './InfoViewer';

const defaultProps = {
  position: [],
  x: 1,
  y: 1,
  trace: 1,
  amplitude: 1,
};

describe('Seismic Section View: Info Viewer', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(InfoViewer, viewStore, viewProps);

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it('Display each point information', async () => {
    const store = getMockedStore();
    page(store, defaultProps);
    expect(await screen.findByText('X : 1')).toBeInTheDocument();
    expect(await screen.findByText('Y : 1')).toBeInTheDocument();
    expect(await screen.findByText('Trace : 1')).toBeInTheDocument();
    expect(await screen.findByText('Amplitude : 1')).toBeInTheDocument();
  });
});
