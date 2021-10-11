// @todo(PP-2044)
/* eslint-disable testing-library/await-async-utils */
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  const functionToDebounce = jest.fn();
  const waitTime = 1000;

  const getDebouncedFunction = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDebounce(functionToDebounce, waitTime)
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should not call debounced function more than once within the debounce wait time', async () => {
    const debouncedFunction = await getDebouncedFunction();

    debouncedFunction();
    debouncedFunction();

    waitFor(() => expect(functionToDebounce).toHaveBeenCalledTimes(1));
  });

  it('should call debounced function again when it is called after the debounce wait time', async () => {
    const debouncedFunction = await getDebouncedFunction();

    debouncedFunction();
    setTimeout(() => debouncedFunction(), waitTime + 1);

    waitFor(() => expect(functionToDebounce).toHaveBeenCalledTimes(2));
  });
});
