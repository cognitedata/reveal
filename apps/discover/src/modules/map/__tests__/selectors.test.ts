import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';

import { useMap } from '../selectors';

describe('map selector test', () => {
  test('intial list', () => {
    const { result, waitForNextUpdate } = renderHook(() => useMap(), {
      wrapper: testWrapper,
    });

    act(() => {
      waitForNextUpdate();
    });

    const data = result.current;
    expect(data.geoFilter).toEqual([]);
    expect(data.otherGeo).toEqual({});
  });
});
