import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import CasingView from './CasingView';

const casingViewProps = {
  name: 'Casing view 1',
  casings: [
    {
      id: 0,
      name: 'intermediate',
      outerDiameter: '22.0',
      startDepth: 10,
      endDepth: 100,
      depthUnit: '',
      metadata: {},
    },
  ],
};

describe('Module Preview Selector', () => {
  const page = (viewProps?: any) =>
    testRenderer(CasingView, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(casingViewProps),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display casing view name`, async () => {
    await defaultTestInit();
    const row = await waitFor(() => screen.findByText(casingViewProps.name));
    expect(row).toBeTruthy();
  });

  it(`should display casing depth indicators`, async () => {
    const { container } = await defaultTestInit();
    const casing = casingViewProps.casings[0];
    const indicatorDescription = `${casing.outerDiameter}" ${casing.name} Casing at ${casing.endDepth} depth`;
    expect(container).toHaveTextContent(indicatorDescription);
  });
});
