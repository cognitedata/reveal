import { renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';

import { useMapContent } from '../useMapContent';

jest.mock('modules/map/selectors', () => ({
  useMap: () => ({
    sources: [{ id: '1', data: {} }],
  }),
}));

jest.mock('../useLayers', () => ({
  useLayers: () => ({
    layersReady: true,
    allLayers: [],
  }),
}));

describe('useMapContent', () => {
  it('should be ok with no layers', async () => {
    const { result } = renderHook(() => useMapContent(), {
      wrapper: testWrapper,
    });

    expect(result.current).toEqual([{ id: '1', data: {} }]);
  });

  it.todo('should get layers');
  // here is a first shot at adding this test:
  //   -it('should get layers', async () => {
  //     const { result, waitForNextUpdate } = renderHook(
  //       () =>
  //         useMapContent(
  //           {
  //             fields: {
  //               remote:
  //                 'https://storage.googleapis.com/discover_layers_us/Quadrants.json',
  //               name: 'Fields',
  //               color: 'rgba(0, 172, 79, 0.8)',
  //               defaultOn: true,
  //             },
  //           },
  //           true
  //         ),
  //       {
  //         wrapper: testWrapper,
  //       }
  //     );

  //     await waitForNextUpdate();
  //     console.log('result', result.current);
  //     expect(result.current).toEqual({
  //       sources: [],
  //       selectableLayers: [],
  //       assets: [],
  //       finished: true,
  //     });
  //   });
});
