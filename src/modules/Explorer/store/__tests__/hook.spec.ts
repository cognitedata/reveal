import { renderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';

import {
  useIsSelectedInExplorer,
  useExplorerFilesSelected,
} from 'src/modules/Explorer/store/hooks';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('Test explorer hooks', () => {
  describe('Test useIsSelectedInExplorer', () => {
    test('Id should be selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useIsSelectedInExplorer(1));
      expect(result.current).toEqual(true);
    });
    test('Id should not be selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useIsSelectedInExplorer(1337));
      expect(result.current).toEqual(false);
    });
  });

  describe('Test useExplorerFilesSelected', () => {
    test('Should have files selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useExplorerFilesSelected());
      expect(result.current).toEqual(true);
    });
    test('Should not have files selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => []);
      const { result } = renderHook(() => useExplorerFilesSelected());
      expect(result.current).toEqual(false);
    });
  });
});
