import { getAuthHeaders } from '../auth';

const mock = jest.fn().mockImplementation(() => {
  return { log: jest.fn() };
});

jest.mock('utils/log', mock);

describe('getAuthHeaders', () => {
  it('should be ok with nothing set', () => {
    expect(getAuthHeaders()).toEqual({ 'api-key': '' });
  });
  it('should set custom api header', () => {
    process.env.REACT_APP_API_KEY = 'test';
    expect(getAuthHeaders('x-api-key')).toEqual({ 'x-api-key': 'test' });
  });
});
