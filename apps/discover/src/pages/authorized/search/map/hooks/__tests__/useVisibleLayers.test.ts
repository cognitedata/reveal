import { renderHook } from '@testing-library/react-hooks';

import { SelectableLayer } from '@cognite/react-map';

import { testWrapper } from '__test-utils/renderer';

import { useVisibleLayers } from '../useVisibleLayers';

const extraLayers: SelectableLayer[] = [
  {
    id: 'no_subs',
    weight: 10,
    name: 'test',
    selected: false,
    layers: [],
  },
  {
    id: 'has_sub_layers',
    weight: 100,
    name: 'test 2',
    selected: false,
    layers: [
      {
        id: 'first_sub_layer',
        weight: 10000000,
        source: 'test',
        type: 'symbol',
      },
      {
        id: 'second_sub_layer',
        weight: 1000,
        source: 'test',
        type: 'symbol',
      },
    ],
  },
];

jest.mock('../useLayers', () => ({
  useLayers: () => ({
    selectableLayers: extraLayers,
    alwaysVisible: [],
  }),
}));

describe('useVisibleLayers', () => {
  it('should sort ok', async () => {
    const { result } = renderHook(() => useVisibleLayers([]), {
      wrapper: testWrapper,
    });

    // console.log('result', result.current);

    const first = result.current[0];
    const last = result.current[result.current.length - 1];
    expect(first.weight).toBeGreaterThan(last.weight || 0);
  });

  it('should have the extra layers', async () => {
    const { result } = renderHook(
      () => useVisibleLayers(extraLayers.map((layer) => layer.id)),
      {
        wrapper: testWrapper,
      }
    );

    // console.log('result', result.current);

    expect(result.current[0].id).toEqual('first_sub_layer');
  });
});
