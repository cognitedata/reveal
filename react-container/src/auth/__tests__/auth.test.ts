import { getAuthHeaders } from '../auth';

describe('getAuthHeaders', () => {
  it('should be ok with nothing set', () => {
    expect(getAuthHeaders()).toEqual({ 'api-key': '' });
  });
});
