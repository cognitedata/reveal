import ADFS from './index';

describe('ADFS Client', () => {
  it('Make sure AAD can be constructed', () => {
    const adfsInstance = new ADFS({
      cluster: 'test-cluster',
      oidc: {
        clientId: 'test-id',
        authority: 'test-authority',
        scope: 'test-scope',
      },
    });

    // @ts-expect-error - private
    expect(adfsInstance.cluster).toEqual('test-cluster');
  });
});
