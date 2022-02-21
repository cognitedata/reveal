import '__mocks/mockCogniteSDK';
import { renderHook } from '@testing-library/react-hooks';

import { testWrapper } from '__test-utils/renderer';
import { useDocumentAssetNames } from 'hooks/useDocumentAssetNames';

describe('useDocumentAssetNames hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentAssetNames([1, 2]),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current;
  };

  it('should return asset names', async () => {
    const response = await getHookResult();
    expect(response.data).toEqual(['Asset 1', 'Asset 2']);
  });
});
