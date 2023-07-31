import { screen } from '@testing-library/react';
import noop from 'lodash/noop';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DatasetSelector } from './DatasetSelector';

const defaultProps = {
  datasets: [],
  selectedDatasets: [],
  handleSelect: noop,
};

describe('Seismic Section View: Dataset Selector', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(DatasetSelector, viewStore, viewProps);

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it('Disable selector on empty dataset', async () => {
    const store = getMockedStore();
    page(store, defaultProps);
    const button = await screen.findByTestId('seismic-dataset-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
