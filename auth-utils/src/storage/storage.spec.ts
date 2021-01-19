/* eslint-disable no-underscore-dangle */
import {
  clearByProject,
  initialiseOnRedirectFlow,
  retrieveAuthResult,
  saveAuthResult,
  getKey,
} from './storage';
import { AuthResult } from './types';

const key = getKey();

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function mockLocation(pathname: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.location;
    window.location = { pathname } as Location;
  }

  it('Make sure localstorage mock work', () => {
    localStorage.setItem('test', 'test');
    expect(localStorage.__STORE__.test).toBe('test');
  });

  it('Store an auth result when accessing route directly', () => {
    mockLocation('/test');
    const saveData: AuthResult = {
      authFlow: 'ADFS',
      accessToken: '123',
      idToken: '123',
      expTime: 0,
    };
    saveAuthResult(saveData);
    const expectation = { test: saveData };
    expect(localStorage.__STORE__[key]).toBe(JSON.stringify(expectation));

    expect(retrieveAuthResult()).toEqual(expectation.test);
  });

  it('Store an auth result on root', () => {
    mockLocation('/');
    const saveData: AuthResult = {
      authFlow: 'ADFS',
      accessToken: '123',
      idToken: '123',
      expTime: 0,
    };
    saveAuthResult(saveData);
    const expectation = { __noproject__: saveData };
    expect(localStorage.__STORE__[key]).toBe(JSON.stringify(expectation));

    expect(retrieveAuthResult()).toEqual(expectation.__noproject__);
  });

  it('Store an auth result on root v2', () => {
    mockLocation('');
    const saveData: AuthResult = {
      authFlow: 'ADFS',
      accessToken: '123',
      idToken: '123',
      expTime: 0,
    };
    saveAuthResult(saveData);
    const expectation = { __noproject__: saveData };
    expect(localStorage.__STORE__[key]).toBe(JSON.stringify(expectation));

    expect(retrieveAuthResult()).toEqual(expectation.__noproject__);
  });

  it('Remove a project from the storage', () => {
    mockLocation('/someproject');
    const saveData: AuthResult = {
      authFlow: 'ADFS',
      accessToken: '123',
      idToken: '123',
      expTime: 0,
    };
    saveAuthResult(saveData);
    const expectation = { someproject: saveData };
    expect(localStorage.__STORE__[key]).toBe(JSON.stringify(expectation));

    clearByProject('someproject');
    expect(retrieveAuthResult()).toEqual(undefined);
  });

  it('Should throw error if initialising a redirect else than on root path', () => {
    mockLocation('/someproject');
    expect(() => initialiseOnRedirectFlow('ADFS')).toThrow();
  });

  it('Should set a flow for redirect root lookup', () => {
    mockLocation('');
    initialiseOnRedirectFlow('ADFS');
    expect(retrieveAuthResult()).toEqual({ authFlow: 'ADFS' });
  });
});
