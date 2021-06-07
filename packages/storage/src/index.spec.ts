/* eslint-disable no-underscore-dangle */
import { storage as localStorageCache } from './index';

describe('localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('make sure localstorage mock works', () => {
    localStorage.setItem('test', 'test');
    expect(localStorage.__STORE__.test).toBe('test');
  });

  it('should be able to get item from storage under correct keys', () => {
    localStorageCache.init({ project: 'my-tenant', appName: 'my-app-name' });

    expect(localStorageCache.getFromLocalStorage('test')).toEqual(undefined);
    expect(
      localStorageCache.getFromLocalStorage('test', 'defaultValue')
    ).toEqual('defaultValue');

    localStorageCache.saveToLocalStorage('test', 'customValue');
    expect(localStorageCache.getFromLocalStorage('test')).toEqual(
      'customValue'
    );
    expect(
      localStorageCache.getFromLocalStorage('test', 'defaultValue')
    ).toEqual('customValue');

    expect(localStorage).toMatchObject({
      '__v3__storage/my-app-name/my-tenant/test': '"customValue"',
    });

    localStorageCache.removeItem('test');

    expect(localStorage).toMatchObject({});
  });

  it('should fall back to simple keys', () => {
    localStorageCache.saveToLocalStorage<string>('test', 'customValue');
    expect(localStorageCache.getFromLocalStorage('test')).toEqual(
      'customValue'
    );
  });

  it('should get a default value with types', () => {
    type Result = { fake: boolean };
    const result = localStorageCache.getFromLocalStorage<Result>(
      'unknownThing',
      {
        fake: true,
      }
    );
    expect(result).toEqual({ fake: true });
  });

  it('should get and set a typed object', () => {
    type Type = { item: string };
    const item: Type = { item: 'testing' };
    localStorageCache.saveToLocalStorage<Type>('typedObject', item);

    const result = localStorageCache.getFromLocalStorage<Type>('typedObject');
    expect(result?.item).toEqual('testing');
  });
});
