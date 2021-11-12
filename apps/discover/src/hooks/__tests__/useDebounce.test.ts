import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  const functionToDebounce = jest.fn();
  const waitTime = 100;

  const getDebouncedFunction = async () => {
    const { result } = renderHook(() =>
      useDebounce(functionToDebounce, waitTime)
    );

    return result.current;
  };

  it('should not call debounced function more than once within the debounce wait time', async () => {
    const debouncedFunction = await getDebouncedFunction();

    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    await waitFor(() => expect(functionToDebounce).toHaveBeenCalledTimes(1), {
      timeout: 1000,
    });
  });

  it('should call debounced function again when it is called after the debounce wait time', async () => {
    const debouncedFunction = await getDebouncedFunction();

    debouncedFunction();
    setTimeout(() => debouncedFunction(), waitTime + 10);

    await waitFor(() => expect(functionToDebounce).toHaveBeenCalledTimes(2), {
      timeout: 1000,
    });
  });
});
