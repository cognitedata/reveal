import getHmac from '../utils/getHmac';

import identityVerification from './identityVerification';

jest.mock('../utils/getHmac');

interface CustomGlobal extends NodeJS.Global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window: any;
}

declare let global: CustomGlobal;

describe('get Hmac key from server', () => {
  beforeEach(() => {
    global.window = {
      Intercom: jest.fn(),
    };
  });

  it('identityVerification resolves', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(() => {
      return Promise.resolve({ hmac: 'hmacHash1234', userUid: 'Unique ID' });
    });
    return identityVerification({
      appsApiUrl: 'test',
      headers: { Authorization: 'test' },
    }).then((response) => {
      expect(response).toEqual({ success: true });
      expect(global.window.Intercom).toHaveBeenCalledWith('update', {
        user_id: 'Unique ID',
        user_hash: 'hmacHash1234',
      });
    });
  });

  it('identityVerification rejects', () => {
    const error = new Error('failure');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getHmac as any).mockImplementation(() => {
      return Promise.reject(error);
    });
    return identityVerification({
      appsApiUrl: 'test',
      headers: { Authorization: 'test' },
    }).then((response) => {
      expect(response).toEqual({ success: false, error });
      expect(global.window.Intercom).not.toHaveBeenCalled();
    });
  });
});
