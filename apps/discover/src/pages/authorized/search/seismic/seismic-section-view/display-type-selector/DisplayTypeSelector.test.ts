import { screen } from '@testing-library/react';
import noop from 'lodash/noop';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DisplayTypeSelector } from './DisplayTypeSelector';

const defaultProps = {
  setDisplayType: noop,
  selected: { id: 'inline', title: 'Inline' },
};

describe('Seismic Section View: Display Selector', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(DisplayTypeSelector, viewStore, viewProps);

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it('Display selected display type (x line / inline)', async () => {
    const store = getMockedStore();
    page(store, defaultProps);
    const row = await screen.findByText('Inline');
    expect(row).toBeInTheDocument();
  });
});
