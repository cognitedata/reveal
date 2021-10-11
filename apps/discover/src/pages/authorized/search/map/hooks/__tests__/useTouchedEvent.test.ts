import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';

import { useTouchedEvent } from '../useTouchedEvent';

describe('useTouchedEvent', () => {
  it('should return touched status after the default debounce time', async () => {
    const debounceTime = 150;
    const { result } = renderHook(() => useTouchedEvent(), {
      wrapper: testWrapper,
    });

    act(() => {
      result.current.touchedEvent
        .find((event) => event.type === 'mousedown')
        ?.callback();
    });

    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(result.current.touched).toEqual(true), {
      timeout: debounceTime,
    });
  });

  it('should return touched status after the custom debounce time', async () => {
    const debounceTime = 300;
    const { result } = renderHook(() => useTouchedEvent(debounceTime), {
      wrapper: testWrapper,
    });

    act(() => {
      result.current.touchedEvent
        .find((event) => event.type === 'mousedown')
        ?.callback();
    });

    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(result.current.touched).toEqual(true), {
      timeout: debounceTime,
    });
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
