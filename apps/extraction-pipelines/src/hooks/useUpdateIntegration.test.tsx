import { QueryCache } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderWithReactQueryCacheProvider } from '../utils/test/render';
import { useUpdateIntegration } from './useUpdateIntegration';

describe('useUpdateIntegration', () => {
  const project = 'itera-int-green';
  const origin = 'dev';
  const cdfEnv = 'greenfield';

  // eslint-disable-next-line
  test.skip('Returns integrations on success', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [] } });

    const queryCache = new QueryCache();

    await act(async () => {
      const wrapper = renderWithReactQueryCacheProvider(
        queryCache,
        origin,
        project,
        cdfEnv
      );
      const { result, waitForNextUpdate } = renderHook(
        () => useUpdateIntegration(),
        { wrapper }
      );
      await waitForNextUpdate(() => {
        expect(result.current).toEqual('');
      });
    });
  });
});
