import { doReAuth } from 'utils/getCogniteSDKClient';

import { handleResponse, getJsonOrText } from '../fetch';

jest.mock('utils/getCogniteSDKClient', () => ({
  doReAuth: jest.fn(),
}));

describe('fetch', () => {
  describe('getJsonOrText', () => {
    it('should be ok', () => {
      expect(getJsonOrText('')).toEqual('');
      expect(getJsonOrText('test')).toEqual('test');
      expect(getJsonOrText('{"test": true}')).toMatchObject({ test: true });
    });
  });

  describe('handleResponse', () => {
    it('catch 401', async () => {
      const authAction = jest.fn(() => Promise.resolve());
      (doReAuth as jest.Mock).mockImplementation(authAction);
      await expect(handleResponse({ status: 401 })).rejects.toThrowError(
        '401 - Trying again with a new token.'
      );

      expect(authAction).toHaveBeenCalled();
    });

    it('rejects 200 without ok', () => {
      return expect(
        handleResponse({
          status: 200,
          text: () => Promise.resolve('{"test": true}'),
        })
      ).rejects.toEqual({ status: 200, test: true });
    });

    it('catch 200', () => {
      return expect(
        handleResponse({
          ok: true,
          status: 200,
          text: () => Promise.resolve('{"test": true}'),
        })
      ).resolves.toEqual({ test: true });
    });

    it('catch errors', () => {
      return expect(
        handleResponse({
          ok: false,
          status: 200,
          text: () =>
            Promise.resolve({
              error: { message: 'failed', errors: ['test-error'] },
            }),
        })
      ).rejects.toEqual(new Error('failed - ["test-error"]'));
    });

    it('catch errors - without errors list', () => {
      return expect(
        handleResponse({
          ok: false,
          status: 200,
          text: () =>
            Promise.resolve({
              error: { message: 'failed' },
            }),
        })
      ).rejects.toEqual(new Error('failed - {"message":"failed"}'));
    });
  });
});
