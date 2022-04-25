import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import DepthIndicator, { DepthIndicatorProps } from './DepthIndicator';

const depthIndicatorProps: DepthIndicatorProps = {
  normalizedCasing: {
    id: 12345,
    name: 'Test Casing',
    outerDiameter: '22.0',
    startDepth: 0,
    endDepth: 1000,
    startDepthTVD: 0,
    endDepthTVD: 800,
    depthUnit: 'ft',
    casingStartDepth: 0,
    casingDepth: 100,
    casingDescription: 'Test casing description',
    liner: false,
    maximumDescription: 'Test maximum description',
  },
  isTied: false,
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
    expect(
      await screen.findByText(
        depthIndicatorProps.normalizedCasing.outerDiameter
      )
    ).toBeInTheDocument();
  });
});
