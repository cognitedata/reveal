import {
  capitalizeFirstLetter,
  getSearchResultCountLabel,
  getTabCountLabel,
  stringContains,
} from '../string';

describe('string', () => {
  describe('stringContains', () => {
    it('should return true', () => {
      expect(stringContains()).toBeTruthy();
    });

    it('should return undefine result', () => {
      expect(stringContains(undefined, 'test')).toBeUndefined();
    });

    it('should be truthy', () => {
      expect(stringContains('test-text', 'test')).toBeTruthy();
    });

    it('should be falsy', () => {
      expect(stringContains('ABC', 'test')).toBeFalsy();
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should be undefined', () => {
      expect(capitalizeFirstLetter()).toBeUndefined();
    });

    it('should return expected result', () => {
      expect(capitalizeFirstLetter('test')).toEqual('Test');
    });
  });

  describe('getTabCountLabel', () => {
    it('should return expected result', () => {
      expect(getTabCountLabel(10000000)).toEqual('10M+');
    });
  });

  describe('getSearchResultCountLabel', () => {
    it('should return expected result ', () => {
      expect(getSearchResultCountLabel(1000, 10000000, 'asset')).toEqual(
        '1 000 of 10 000 000 assets'
      );
    });
  });
});
