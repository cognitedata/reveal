import {
  doReAuth,
  getEmail,
  setEmail,
  setReAuth,
} from 'utils/getCogniteSDKClient';

describe('getCogniteSDKClient', () => {
  it('get email', () => {
    setEmail('test@gmail.com');
    expect(getEmail()).toEqual('test@gmail.com');
  });

  it('get auth', () => {
    const value = 'auth';
    const auth = () => value;
    setReAuth(auth);
    expect(doReAuth()).toEqual(value);
  });
});
