import { filters } from '../filters';

describe('filters', () => {
  describe('toContainsAny', () => {
    test('empty', () => {
      expect(filters.toContainsAny()).toEqual(undefined);
    });
  });

  describe('toContainsAll', () => {
    test('empty', () => {
      expect(filters.toContainsAll()).toEqual(undefined);
    });
  });

  describe('toIdentifier', () => {
    test('string', () => {
      expect(filters.toIdentifier('1')).toEqual({ matchingId: '1' });
    });
    test('number', () => {
      expect(filters.toIdentifier(1)).toEqual({ matchingId: '1' });
    });
  });

  describe('toPropertyFilter', () => {
    test('empty', () => {
      expect(filters.toPropertyFilter()).toEqual(undefined);
    });
  });

  describe('toHourRange', () => {
    test('empty', () => {
      expect(filters.toHourRange()).toEqual(undefined);
    });
  });

  describe('toDateRange', () => {
    test('empty', () => {
      expect(filters.toDateRange()).toEqual({});
    });
  });
});
