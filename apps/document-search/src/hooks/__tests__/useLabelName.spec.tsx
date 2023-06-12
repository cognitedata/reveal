import { renderHook } from '@testing-library/react-hooks';
import { useLabelName } from 'src/hooks/useLabelName';
import { TestProviderWrapper } from 'src/utils/test/render';

describe('hook:useLabelName', () => {
  it('Finds the label name based on external id', async () => {
    const { result, waitFor } = renderHook(() => useLabelName('test'), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.labelName).toBe('test_label');
  });

  it('Defaults to the external id if label name is undefined', async () => {
    const { result, waitFor } = renderHook(() => useLabelName('unknown'), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.labelName).toBe('unknown');
  });
});
