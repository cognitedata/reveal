import { screen, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';
import { SELECT_LAYER } from 'modules/map/types.actions';

import Layers, { Props } from '../Layers';

describe('Layers  Content', () => {
  const getPage = (viewStore: AppStore, viewProps?: Props) =>
    testRenderer(Layers, viewStore, viewProps);

  const layer1 = {
    id: 'layer1',
    layers: [],
    name: 'Layer 1',
    selected: false,
  };

  let store: AppStore;

  beforeEach(() => {
    store = getMockedStore();
  });

  const defaultTestInit = async (viewProps?: Partial<Props>) => {
    const props = {
      layers: [layer1],
      allLayers: { layer1: { name: 'l1', color: '#FF5733', defaultOn: true } },
      handleClose: noop,
      ...viewProps,
    };
    return {
      ...getPage(store, props),
      store,
    };
  };

  it('should open the select layers panel and select a layer', async () => {
    await defaultTestInit({});

    const layerCheckbox = await screen.findByTestId(`layer-${layer1.id}`);

    fireEvent.click(layerCheckbox);

    expect(store.getActions()).toEqual([
      {
        id: 'layer1',
        type: SELECT_LAYER,
      },
    ]);
  });
});
