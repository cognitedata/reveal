import 'services/documents/__mocks/setupDocumentsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import uniqueId from 'lodash/uniqueId';

import { useDocument } from '../useDocument';

describe('useDocument hook', () => {
  const externalId = String(parseInt(uniqueId(), 10));

  it('should return `isLoading` as `true` when both `doc` and `error` not exist', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDocument(externalId)
    );
    waitForNextUpdate();
    const [doc, isLoading, error] = result.current;

    expect(doc).toBeFalsy();
    expect(isLoading).toBeTruthy();
    expect(error).toBeFalsy();
  });
});
