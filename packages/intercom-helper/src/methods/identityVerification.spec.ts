import { GetHmacSettings } from 'types';

import getHmac from '../utils/getHmac';

import identityVerification from './identityVerification';

jest.mock('../utils/getHmac');

describe('get Hmac key from server', () => {
  beforeEach(() => {
    window.Intercom = jest.fn();
  });

  it('identityVerification resolves with no project', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(
      (): Promise<GetHmacSettings> =>
        Promise.resolve({
          hmac: 'hmacHash1234',
          userUid: 'Unique ID',
          userName: 'user name',
        })
    );
    return identityVerification({
      appsApiUrl: 'fakeUrl',
      headers: { Authorization: 'test' },
    }).then((response) => {
      expect(getHmac).toHaveBeenCalledWith(
        'fakeUrl',
        {
          Authorization: 'test',
        },
        undefined
      );
      expect(response).toEqual({ success: true });
      expect(window.Intercom).toHaveBeenCalledWith('update', {
        name: 'user name',
        user_id: 'Unique ID',
        user_hash: 'hmacHash1234',
      });
    });
  });

  it('identityVerification rejects with no project', () => {
    const error = new Error('failure');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(() => Promise.reject(error));
    return identityVerification({
      appsApiUrl: 'fakeUrl',
      headers: { Authorization: 'test' },
    }).then((response) => {
      expect(getHmac).toHaveBeenCalledWith(
        'fakeUrl',
        {
          Authorization: 'test',
        },
        undefined
      );
      expect(response).toEqual({ success: false, error });
      expect(window.Intercom).not.toHaveBeenCalled();
    });
  });

  it('identityVerification resolves with project', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(
      (): Promise<GetHmacSettings> =>
        Promise.resolve({
          hmac: 'hmacHash1234',
          userUid: 'Unique ID',
          userName: 'user name',
        })
    );
    return identityVerification({
      appsApiUrl: 'fakeUrl',
      headers: { Authorization: 'test' },
      project: 'myFakeProject',
    }).then((response) => {
      expect(getHmac).toHaveBeenCalledWith(
        'fakeUrl',
        {
          Authorization: 'test',
        },
        'myFakeProject'
      );
      expect(response).toEqual({ success: true });
      expect(window.Intercom).toHaveBeenCalledWith('update', {
        name: 'user name',
        user_id: 'Unique ID',
        user_hash: 'hmacHash1234',
      });
    });
  });

  it('identityVerification rejects with project', () => {
    const error = new Error('failure');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(() => Promise.reject(error));
    return identityVerification({
      appsApiUrl: 'fakeUrl',
      headers: { Authorization: 'test' },
      project: 'myFakeProject',
    }).then((response) => {
      expect(getHmac).toHaveBeenCalledWith(
        'fakeUrl',
        {
          Authorization: 'test',
        },
        'myFakeProject'
      );
      expect(response).toEqual({ success: false, error });
      expect(window.Intercom).not.toHaveBeenCalled();
    });
  });
});
