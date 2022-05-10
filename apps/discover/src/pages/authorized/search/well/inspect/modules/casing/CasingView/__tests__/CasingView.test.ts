import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { UserPreferredUnit } from 'constants/units';

import { SIDE_MODES } from '../../constants';
import CasingView from '../CasingView';
import { CasingViewTypeProps } from '../interfaces';

const props: CasingViewTypeProps = {
  wellboreName: 'Wllbore 1',
  wellName: 'Well 1',
  waterDepth: 10,
  rkbLevel: 20,
  unit: UserPreferredUnit.FEET,
  nptEvents: [],
  ndsEvents: [],
  casings: [
    {
      id: 0,
      name: 'intermediate',
      outerDiameter: '22.0',
      startDepth: 10,
      endDepth: 100,
      startDepthTVD: 10,
      endDepthTVD: 80,
      depthUnit: '',
    },
  ],
  sideMode: SIDE_MODES.One,
};

describe('Casing view', () => {
  const defaultStore = getMockedStore();

  const page = (props?: CasingViewTypeProps, store: Store = defaultStore) =>
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
