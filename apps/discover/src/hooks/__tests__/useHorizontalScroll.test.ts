import { renderHook } from '@testing-library/react-hooks';

import { useHorizontalScroll } from '../useHorizontalScroll';

/**
 * SHOULD ADD MORE UNIT TESTS THAT TESTS THE COMPONENT IS SCROLLED HORIZONTALLY ON MOUSE WHEEL EVENT
 */

describe('useHorizontalScroll hook', () => {
  it('should return a ref as expected', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useHorizontalScroll()
    );
    waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });
});
