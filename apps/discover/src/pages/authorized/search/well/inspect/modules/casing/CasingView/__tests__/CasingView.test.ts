import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { UserPreferredUnit } from 'constants/units';

import CasingView from '../CasingView';
import { CasingViewType } from '../interfaces';

const props: CasingViewType = {
  wellboreName: 'Wllbore 1',
  wellName: 'Well 1',
  unit: UserPreferredUnit.FEET,
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
    },
  ],
};

describe('Casing view', () => {
  const defaultStore = getMockedStore();

  const page = (props?: CasingViewType, store: Store = defaultStore) =>
    testRenderer(CasingView, store, props);

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
