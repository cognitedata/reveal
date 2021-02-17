import { renderHook } from '@testing-library/react-hooks';
import { getAuthHeaders } from '../auth';

const mock = jest.fn().mockImplementation(() => {
  return { log: jest.fn() };
});

jest.mock('utils/log', mock);

describe('getAuthHeaders', () => {
  it('should be ok with nothing set', () => {
    const { result } = renderHook(() => getAuthHeaders());

    expect(result.current).toEqual({ 'api-key': '' });
  });
  it('should set custom api header', () => {
    process.env.REACT_APP_API_KEY = 'test';
    const { result } = renderHook(() => getAuthHeaders());
    expect(result.current).toEqual({ 'api-key': 'test' });
  });
});
