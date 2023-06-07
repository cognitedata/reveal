import { renderHook, act } from '@testing-library/react-hooks';

import { useSessionStorage } from '../storage/useSessionStorage';

const TEST_KEY = 'key';
const TEST_VALUE = { test: 'test' };

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterAll(() => {
    sessionStorage.clear();
  });

  it('should set session storage for the given key and value', () => {
    renderHook(() => useSessionStorage<{ test: string }>(TEST_KEY, TEST_VALUE));
    expect(JSON.parse(sessionStorage.getItem(TEST_KEY) || '')).toEqual(
      TEST_VALUE
    );
  });

  it('should get/set value from session storage for the given key', () => {
    const { result } = renderHook(() =>
      useSessionStorage<{ test: string }>(TEST_KEY, TEST_VALUE)
    );
    const [value, setValue] = result.current;

    expect(value).toEqual(TEST_VALUE);

    const newValue = { test: 'new value' };
    act(() => {
      setValue(newValue);
    });
    expect(JSON.parse(sessionStorage.getItem(TEST_KEY) || '')).toEqual(
      newValue
    );
  });

  it('should get current value when value param is not given', () => {
    sessionStorage.setItem(TEST_KEY, JSON.stringify(TEST_VALUE));
    const { result } = renderHook(() =>
      useSessionStorage<{ test: string }>(TEST_KEY)
    );
    const [value] = result.current;
    expect(JSON.parse(sessionStorage.getItem(TEST_KEY) || '')).toEqual(value);
  });
});
