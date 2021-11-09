import { act } from 'react-test-renderer';

import { renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';

import { useTouchedEvent } from '../useTouchedEvent';

describe('useTouchedEvent', () => {
  it('should return touched status after the default debounce time', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTouchedEvent(), {
      wrapper: testWrapper,
    });

    act(() => {
      result.current.touchedEvent
        .find((event) => event.type === 'mousedown')
        ?.callback();
    });

    await waitForNextUpdate();
    expect(result.current.touched).toEqual(true);
  });

  it('should return touched status after the custom debounce time', async () => {
    const debounceTime = 300;
    const { result, waitForNextUpdate } = renderHook(
      () => useTouchedEvent(debounceTime),
      {
        wrapper: testWrapper,
      }
    );

    act(() => {
      result.current.touchedEvent
        .find((event) => event.type === 'mousedown')
        ?.callback();
    });

    await waitForNextUpdate();
    expect(result.current.touched).toEqual(true);
  });

  it('should not return touched status before the debounce time', async () => {
    const { result } = renderHook(() => useTouchedEvent(), {
      wrapper: testWrapper,
    });

    act(() => {
      result.current.touchedEvent
        .find((event) => event.type === 'mousedown')
        ?.callback();
    });

    expect(result.current.touched).toEqual(false);
  });
});
