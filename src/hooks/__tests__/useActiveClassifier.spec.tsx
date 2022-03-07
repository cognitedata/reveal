import { renderHook } from '@testing-library/react-hooks';
import { useActiveClassifier } from 'src/hooks/useActiveClassifier';
import { TestProviderWrapper } from 'src/utils/test/render';

describe('hook:useActiveClassifier', () => {
  it('Finds the active classifier amongst list of classifiers', async () => {
    const { result, waitFor } = renderHook(() => useActiveClassifier(), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.active).toBeTruthy();
    expect(result.current.data!.status).toBe('finished');
  });
});
