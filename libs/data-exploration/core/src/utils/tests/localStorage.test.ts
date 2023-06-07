import { getLocalStorageObjectByKey } from '../localStorage';

describe('getLocalStorageObjectByKey', () => {
  jest.spyOn(Storage.prototype, 'setItem');
  jest.spyOn(Storage.prototype, 'getItem');
  it('Should return the object from localstorage', () => {
    const testObject = { test: 'value' };
    localStorage.setItem('test', JSON.stringify(testObject));
    const result = getLocalStorageObjectByKey('test');
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(result).toEqual(testObject);
  });

  it("should return undefined if the key doesn't exist", () => {
    expect(getLocalStorageObjectByKey('abc')).toBeUndefined();
  });
});
