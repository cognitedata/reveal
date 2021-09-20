import axios from 'axios';
import { GetHmacSettings } from 'types';

import getHmac from './getHmac';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('get Hmac key from server', () => {
  it('getHmac resolves no project', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(
      (): Promise<{ data: GetHmacSettings }> =>
        Promise.resolve({
          data: {
            hmac: 'hmacHash1234',
            userUid: 'Unique ID',
            userName: 'user name',
          },
        })
    );
    return getHmac('fakeUrl', { Authorization: 'test' }).then((data) => {
      expect(axios.get).toHaveBeenCalledWith('fakeUrl/intercom', {
        params: {},
        headers: { Authorization: 'test' },
      });
      expect(data).toEqual({
        hmac: 'hmacHash1234',
        userUid: 'Unique ID',
        userName: 'user name',
      });
    });
  });

  it('getHmac rejects no project', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(() =>
      Promise.reject(new Error('failure'))
    );
    let errorMessage: string;

    return getHmac('fakeUrl', { Authorization: 'test' })
      .catch((error) => {
        errorMessage = error.message;
      })
      .finally(() => {
        expect(axios.get).toHaveBeenCalledWith('fakeUrl/intercom', {
          params: {},
          headers: { Authorization: 'test' },
        });
        expect(errorMessage).toBe('failure');
      });
  });

  it('getHmac resolves with project', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(
      (): Promise<{ data: GetHmacSettings }> =>
        Promise.resolve({
          data: {
            hmac: 'hmacHash1234',
            userUid: 'Unique ID',
            userName: 'user name',
          },
        })
    );
    return getHmac('fakeUrl', { Authorization: 'test' }, 'fakeProject').then(
      (data) => {
        expect(axios.get).toHaveBeenCalledWith('fakeUrl/fakeProject/intercom', {
          params: {},
          headers: { Authorization: 'test' },
        });
        expect(data).toEqual({
          hmac: 'hmacHash1234',
          userUid: 'Unique ID',
          userName: 'user name',
        });
      }
    );
  });

  it('getHmac rejects with project', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get.mockImplementation(() =>
      Promise.reject(new Error('failure'))
    );
    let errorMessage: string;

    return getHmac('fakeUrl', { Authorization: 'test' }, 'fakeProject')
      .catch((error) => {
        errorMessage = error.message;
      })
      .finally(() => {
        expect(axios.get).toHaveBeenCalledWith('fakeUrl/fakeProject/intercom', {
          params: {},
          headers: { Authorization: 'test' },
        });
        expect(errorMessage).toBe('failure');
      });
  });
});
