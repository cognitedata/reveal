import { min, max, minMax } from '../minMax';

describe('minMax', () => {
  describe('min', () => {
    it('should return minimum value', () => {
      expect(min([0, 1, 2, 3, 4, 5])).toEqual(0);
      expect(min([5, 4, 3, 2, 1, 0])).toEqual(0);
      expect(min([1, 2, 3, 4, 5, 6])).toEqual(1);
      expect(min([6, 5, 4, 3, 2, 1])).toEqual(1);
      expect(min([10, 22, 5, 102, 15])).toEqual(5);
      expect(min([10, -4, 16, -16])).toEqual(-16);
      expect(min([10.55, 21.02, 10.52, 42, 35, 62.05])).toEqual(10.52);
    });

    it('should handle null values', () => {
      expect(min([null, null, null] as unknown as number[])).toEqual(0);
      expect(min([10, 22, null as unknown as number, 102, 15])).toEqual(0);
    });
  });

  describe('max', () => {
    it('should return minimum value', () => {
      expect(max([0, 1, 2, 3, 4, 5])).toEqual(5);
      expect(max([5, 4, 3, 2, 1, 0])).toEqual(5);
      expect(max([1, 2, 3, 4, 5, 6])).toEqual(6);
      expect(max([6, 5, 4, 3, 2, 1])).toEqual(6);
      expect(max([10, 22, 5, 102, 15])).toEqual(102);
      expect(max([10, -4, 16, -16])).toEqual(16);
      expect(max([10.55, 21.02, 10.52, 42, 35, 62.05])).toEqual(62.05);
    });

    it('should handle null values', () => {
      expect(min([null, null, null] as unknown as number[])).toEqual(0);
      expect(max([10, 22, null as unknown as number, 102, 15])).toEqual(102);
    });
  });

  describe('minMax', () => {
    it('should return minimum and maximum value', () => {
      expect(minMax([0, 1, 2, 3, 4, 5])).toEqual([0, 5]);
      expect(minMax([5, 4, 3, 2, 1, 0])).toEqual([0, 5]);
      expect(minMax([1, 2, 3, 4, 5, 6])).toEqual([1, 6]);
      expect(minMax([6, 5, 4, 3, 2, 1])).toEqual([1, 6]);
      expect(minMax([10, 22, 5, 102, 15])).toEqual([5, 102]);
      expect(minMax([10, -4, 16, -16])).toEqual([-16, 16]);
      expect(minMax([10.55, 21.02, 10.52, 42, 35, 62.05])).toEqual([
        10.52, 62.05,
      ]);
    });

    it('should handle null values', () => {
      expect(minMax([null, null, null] as unknown as number[])).toEqual([0, 0]);
      expect(minMax([10, 22, null as unknown as number, 102, 15])).toEqual([
        0, 102,
      ]);
    });
  });
});
