// @todo(PP-2044)
/* eslint-disable testing-library/await-async-utils */
import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useWindowDimensions } from '../useWindowDimensions';

describe('useWindowDimensions hook', () => {
  beforeEach(() => {
    window.resizeTo = jest.fn();
  });

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
    act(() => {
      window.resizeTo(1600, 1200);
    });

    const { width: widthBefore, height: heightBefore } =
      await getWindowDimensions();

    waitFor(() => {
      expect(widthBefore).toEqual(1600);
      expect(heightBefore).toEqual(1200);
    });

    act(() => {
      window.resizeTo(500, 500);
    });

    const { width: widthAfter, height: heightAfter } =
      await getWindowDimensions();

    waitFor(() => {
      expect(widthAfter).toEqual(500);
      expect(heightAfter).toEqual(500);
    });
  });
});
