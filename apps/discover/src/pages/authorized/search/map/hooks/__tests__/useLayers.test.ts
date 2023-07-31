import { renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';
import { useMap } from 'modules/map/selectors';
import allLayers from 'tenants/test/layers';

import { useSearchableLayers } from '../useSearchableLayers';

describe('useLayers', () => {
  // actually to test this we need the map sources in the store
  // but i think they should NOT live there
  // so no point mocking it into the test store
  // better to refactor that whole system to use provided state
  describe('useSearchableLayers', () => {
    it('should be ok - not finished', () => {
      const { result } = renderHook(() => useMap(), {
        wrapper: testWrapper,
      });

      const { selectedLayers } = result.current;
      // -- todo- set these up in the mock store?
      // or dispatch, then proceed to finish test here
      expect(selectedLayers).toEqual([]);

      const { result: searchableResult } = renderHook(
        () => useSearchableLayers(allLayers, []),
        {
          wrapper: testWrapper,
        }
      );

      expect(searchableResult.current).toEqual([]);
    });
  });
});
