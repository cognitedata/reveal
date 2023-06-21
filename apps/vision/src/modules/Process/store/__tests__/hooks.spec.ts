import { renderHook } from '@testing-library/react-hooks';
import { useSelector } from 'react-redux';
import {
  useIsSelectedInProcess,
  useProcessFilesSelected,
} from 'src/modules/Process/store/hooks';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('Test process hooks', () => {
  describe('Test useIsSelectedInProcess hook', () => {
    test('Id should be selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useIsSelectedInProcess(1));
      expect(result.current).toEqual(true);
    });

    test('Id should not be selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useIsSelectedInProcess(1337));
      expect(result.current).toEqual(false);
    });

    test('Id should not be selected if there are no selected ids', () => {
      (useSelector as jest.Mock).mockImplementation(() => []);
      const { result } = renderHook(() => useIsSelectedInProcess(1337));
      expect(result.current).toEqual(false);
    });
  });

  describe('Test useProcessFilesSelected', () => {
    test('Should have files selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => [1, 2, 3, 4]);
      const { result } = renderHook(() => useProcessFilesSelected());
      expect(result.current).toEqual(true);
    });

    test('Should not have files selected', () => {
      (useSelector as jest.Mock).mockImplementation(() => []);
      const { result } = renderHook(() => useProcessFilesSelected());
      expect(result.current).toEqual(false);
    });
  });
});
