import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useWindowDimensions } from '../useWindowDimensions';

describe('useWindowDimensions hook', () => {
  const getWindowDimensions = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWindowDimensions()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return window dimensions', async () => {
    const { width, height } = await getWindowDimensions();

    expect(width).toBeTruthy();
    expect(height).toBeTruthy();
  });

  it('should return updated window dimensions on window resize', async () => {
    await waitFor(() => {
      Object.assign(window, { innerHeight: 1200, innerWidth: 1600 });
    });

    const { width: widthBefore, height: heightBefore } =
      await getWindowDimensions();

    expect(widthBefore).toEqual(1600);
    expect(heightBefore).toEqual(1200);

    await waitFor(() => {
      Object.assign(window, {
        innerHeight: 500,
        innerWidth: 500,
      }).dispatchEvent(new Event('resize'));
    });

    const { width: widthAfter, height: heightAfter } =
      await getWindowDimensions();

    expect(widthAfter).toEqual(500);
    expect(heightAfter).toEqual(500);
  });
});
