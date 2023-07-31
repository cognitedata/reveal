import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import { getMockDocument } from '__test-utils/fixtures/document';

import { useExtractParentFolder } from '../useExtractParentFolder';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useExtractParentFolder hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
  });

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useExtractParentFolder()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should not dispatch action when parent path is undefined', () => {
    const extractParentFolder = getHookResult();
    const document = getMockDocument({}, { filepath: undefined });

    extractParentFolder(document);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch action when parent path is defined', () => {
    const extractParentFolder = getHookResult();
    const document = getMockDocument({}, { filepath: '/filepath' });

    extractParentFolder(document);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
