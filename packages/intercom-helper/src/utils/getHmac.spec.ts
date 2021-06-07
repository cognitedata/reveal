import axios from 'axios';
import getHmac from './getHmac';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('get Hmac key from server', () => {
  it('getHmac resolves', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(() => {
      return Promise.resolve({
        data: { hmac: 'hmacHash1234', userUid: 'Unique ID' },
      });
    });
    return getHmac('test', { Authorization: 'test' }).then((data) => {
      expect(data).toEqual({ hmac: 'hmacHash1234', userUid: 'Unique ID' });
    });
  });

  it('getHmac rejects', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(() => {
      return Promise.reject(new Error('failure'));
    });
    return getHmac('test', { Authorization: 'test' }).catch((error) => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error.message).toBe('failure');
    });
  });
});
