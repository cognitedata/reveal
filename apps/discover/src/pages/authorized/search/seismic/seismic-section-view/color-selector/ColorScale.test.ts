import { screen } from '@testing-library/react';
import noop from 'lodash/noop';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { ColorScale } from './ColorScale';

const defaultProps = {
  startColor: '',
  middleColor: '',
  endColor: '',
  amplitudeRange: [0, 100],
  setColorScaleRange: noop,
};

describe('Seismic Section View: Color Scale', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(ColorScale, viewStore, viewProps);

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it('Display amplitude range as min and max values', async () => {
    const store = getMockedStore();
    page(store, defaultProps);
    const minValue = await screen.findByTestId('min-value-text');
    const maxValue = await screen.findByTestId('max-value-text');
    expect(minValue).toBeInTheDocument();
    expect(maxValue).toBeInTheDocument();
    expect(minValue).toHaveValue(defaultProps.amplitudeRange[0]);
    expect(maxValue).toHaveValue(defaultProps.amplitudeRange[1]);
  });
});
