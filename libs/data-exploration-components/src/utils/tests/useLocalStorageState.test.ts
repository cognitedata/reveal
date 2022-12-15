import { saveToLocalStorage, storage } from '@cognite/storage';
import { renderHook } from '@testing-library/react-hooks';
import { useLocalStorageState } from '../useLocalStorageState';

const columnsVisibility = {
  description: true,
  externalId: false,
  lastUpdatedTime: false,
  createdTime: false,
  id: true,
  dataSetId: false,
  startTime: false,
  endTime: false,
  source: false,
  assetId: false,
};

const localStorageMock = (function () {
  let store: { [key: string]: unknown } = {};

  return {
    getItem(key: string) {
      return store[key];
    },

    setItem(key: string, value: any) {
      store[key] = value;
    },

    clear() {
      store = {};
    },

    removeItem(key: string) {
      delete store[key];
    },

    getAll() {
      return store;
    },
  };
})();

describe('useLocalStorageState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    storage.init({ project: 'test', appName: 'data-explorer' });
  });
  it('should return default value if not localStorage is present', async () => {
    const { result } = renderHook(() =>
      useLocalStorageState('test', columnsVisibility)
    );

    const [data] = result.current;
    expect(data).toEqual(columnsVisibility);
  });

  it('should return correct data when localStorageState is {}', () => {
    // write to localStorage
    saveToLocalStorage('-test1', JSON.stringify({}));
    const { result } = renderHook(() =>
      useLocalStorageState('test1', columnsVisibility)
    );

    const [data] = result.current;
    expect(data).toEqual(columnsVisibility);
  });

  it('should return correct data when localStorageState has defined values', () => {
    // write to localStorage
    saveToLocalStorage('-test2', JSON.stringify({ id: false, assetId: true }));
    const { result } = renderHook(() =>
      useLocalStorageState('test2', columnsVisibility)
    );

    const [data] = result.current;
    expect(data).toEqual({ ...columnsVisibility, id: false, assetId: true });
  });

  it('should update state when defaultValues change', () => {
    // write to localStorage
    saveToLocalStorage('-test1', JSON.stringify({}));
    const { result, rerender } = renderHook(
      columnsState => useLocalStorageState('test1', columnsState),
      {
        initialProps: columnsVisibility,
      }
    );

    const updatedDefault = { ...columnsVisibility, ['newKey1']: true };
    rerender(updatedDefault);

    const [data] = result.current;
    expect(data).toEqual({ ...columnsVisibility, ['newKey1']: true });
  });
});
