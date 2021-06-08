import { storage as localStorageCache } from '../index';

describe('localStorage', () => {
  it('Should be able to get item from storage under correct keys', () => {
    localStorageCache.init({ tenant: 'my-tenant', appName: 'my-app-name' });

    expect(localStorageCache.getItem('test')).toEqual(undefined);
    expect(localStorageCache.getItem('test', 'defaultValue')).toEqual(
      'defaultValue'
    );

    localStorageCache.setItem('test', 'customValue');
    expect(localStorageCache.getItem('test')).toEqual('customValue');
    expect(localStorageCache.getItem('test', 'defaultValue')).toEqual(
      'customValue'
    );

    expect(localStorage).toMatchObject({
      '__v2__storage/my-app-name/my-tenant/test': '"customValue"',
    });

    localStorageCache.removeItem('test');

    expect(localStorage).toMatchObject({});
  });
});
