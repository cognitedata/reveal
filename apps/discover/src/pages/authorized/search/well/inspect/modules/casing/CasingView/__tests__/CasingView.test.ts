import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import CasingView from '../CasingView';

const props = {
  wellboreName: 'Wllbore 1',
  wellName: 'Well 1',
  unit: 'ft',
  events: [],
  isEventsLoading: true,
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

describe('Casing view', () => {
  const page = (viewProps?: any) =>
    testRenderer(CasingView, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display well name`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(props.wellName)).toBeInTheDocument();
  });

  it(`should display wellbore name`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(props.wellboreName)).toBeInTheDocument();
  });
});
