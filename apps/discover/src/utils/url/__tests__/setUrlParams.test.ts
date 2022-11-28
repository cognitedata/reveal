import { renderHook } from '@testing-library/react-hooks';
import { LocationDescriptor } from 'history';

import { useSetUrlParams } from '../setUrlParams';

const setWindowLocation = (location: LocationDescriptor) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });
};

const baseSearch = '?test=true';

const mockReplace = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      replace: mockReplace,
    }),
  };
});

describe('setUrlParams', () => {
  afterAll(() => setWindowLocation({}));

  it('should completly replace all keys', () => {
    setWindowLocation({
      search: baseSearch,
    });

    const { result } = renderHook(() => useSetUrlParams());

    result.current('nice=one&good=job');

    const call = mockReplace.mock.lastCall[0];

    expect(call.search).toEqual('nice=one&good=job');
  });

  it('should keep keys listed with preserveKeys', () => {
    setWindowLocation({
      search: baseSearch,
    });

    const { result } = renderHook(() => useSetUrlParams());

    result.current('nice=one', { preserveKeys: ['test'] });

    const call = mockReplace.mock.lastCall[0];

    expect(call.search).toEqual('test=true&nice=one');
  });

  it('should keep keys listed with preserveKeys when doing a reset', () => {
    setWindowLocation({
      search: baseSearch,
    });

    const { result } = renderHook(() => useSetUrlParams());

    result.current('', { preserveKeys: ['test'] });

    const call = mockReplace.mock.lastCall[0];

    expect(call.search).toEqual('test=true');
  });

  it('should keep keys listed with preserveKeyFilters', () => {
    setWindowLocation({
      search: '?filter_test=true&other_thing=true',
    });

    const { result } = renderHook(() => useSetUrlParams());

    result.current('nice=one', { preserveKeyFilters: ['filter_'] });

    const call = mockReplace.mock.lastCall[0];

    expect(call.search).toEqual('filter_test=true&nice=one');
  });

  it('should keep keys listed with either preserveKeys or preserveKeyFilters', () => {
    setWindowLocation({
      search: '?filter_test=true&other_thing=true&test=true',
    });

    const { result } = renderHook(() => useSetUrlParams());

    result.current('nice=one', {
      preserveKeys: ['test'],
      preserveKeyFilters: ['filter_'],
    });

    const call = mockReplace.mock.lastCall[0];

    expect(call.search).toEqual('test=true&filter_test=true&nice=one');
  });
});
