/* eslint-disable no-underscore-dangle */

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Make sure localstorage mock work', () => {
    localStorage.setItem('test', 'test');
    expect(localStorage.__STORE__.test).toBe('test');
  });
});
