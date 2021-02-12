import AAD from './aad';

describe('AAD Client', () => {
  it('Make sure AAD can be constructed', () => {
    const msalConfig = {
      auth: {
        authority: '',
        clientId: '',
      },
    };
    const aadInstance = new AAD(msalConfig, 'test-cluster');

    // @ts-expect-error - private
    expect(aadInstance.cluster).toEqual('test-cluster');

    // @ts-expect-error - private
    expect(aadInstance.userScopes).toEqual(['User.Read']);
  });
});
