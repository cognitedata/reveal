/* eslint-disable no-underscore-dangle */
import {
  saveToLocalStorage,
  getFromLocalStorage,
  getFlow,
  saveFlow,
} from './storage';

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Make sure localstorage mock work', () => {
    localStorage.setItem('test', 'test');
    expect(localStorage.__STORE__.test).toBe('test');
  });

  it('Make sure saveToLocalStorage works', () => {
    saveToLocalStorage('test1', 'test-value');
    expect(localStorage.__STORE__.test1).toBe('"test-value"');
  });

  it('Make sure getFromLocalStorage works', () => {
    saveToLocalStorage('test2', 'test-value2');
    getFromLocalStorage('test2');
    expect(localStorage.__STORE__.test2).toBe('"test-value2"');
  });

  it('Make sure saveFlow/getFlow works', () => {
    const { flow } = getFlow();
    expect(flow).toBe(undefined);
    saveFlow('ADFS');
    const { flow: secondTime } = getFlow();
    expect(secondTime).toBe('ADFS');
  });
});
