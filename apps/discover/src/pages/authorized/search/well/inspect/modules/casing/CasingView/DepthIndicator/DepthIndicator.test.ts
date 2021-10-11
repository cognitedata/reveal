import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import DepthIndicator from './DepthIndicator';

const depthIndicatorProps = {
  casingDepth: 100,
  description: '22.0" intermediate casing 2',
};

describe('Depth Indicator', () => {
  const page = (viewProps?: any) =>
    testRenderer(DepthIndicator, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(depthIndicatorProps),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display casing description`, async () => {
    await defaultTestInit();
    const row = await waitFor(() =>
      screen.findByText(depthIndicatorProps.description)
    );
    expect(row).toBeTruthy();
  });
});
