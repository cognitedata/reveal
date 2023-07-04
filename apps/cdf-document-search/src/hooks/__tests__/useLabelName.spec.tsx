import { renderHook, waitFor } from '@testing-library/react';

import { useLabelName } from '../../../../cdf-document-search/src/hooks/useLabelName';
import { TestProviderWrapper } from '../../../../cdf-document-search/src/utils/test/render';

describe('hook:useLabelName', () => {
  it('Finds the label name based on external id', async () => {
    const { result } = renderHook(() => useLabelName('test'), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.labelName).toBe('test_label');
  });

  it('Defaults to the external id if label name is undefined', async () => {
    const { result } = renderHook(() => useLabelName('unknown'), {
      wrapper: TestProviderWrapper,
    });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.labelName).toBe('unknown');
  });
});
