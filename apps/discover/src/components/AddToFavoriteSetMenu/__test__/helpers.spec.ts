import { isSetFavoredInDocuments, isSetFavoredInWells } from '../helpers';

describe('helpers', () => {
  describe('isSetFavoredInWells', () => {
    it('should calculate favored status correctly', () => {
      expect(isSetFavoredInWells(undefined, { 1: [] })).toBeFalsy();
      expect(isSetFavoredInWells({}, {})).toBeFalsy();
      expect(isSetFavoredInWells({ 1: [] }, {})).toBeFalsy();
      expect(isSetFavoredInWells({ 1: [] }, { 2: ['1', '2'] })).toBeFalsy();
      expect(
        isSetFavoredInWells(
          { 1: ['1', '2', '3'], 2: [] },
          { 1: ['1', '2'], 2: [] }
        )
      ).toBeFalsy();
      expect(
        isSetFavoredInWells(
          { 1: ['1', '2'], 2: [], 3: [] },
          { 1: ['1', '2'], 2: [] }
        )
      ).toBeFalsy();

      expect(isSetFavoredInWells({ 1: [] }, { 1: [] })).toBeTruthy();
      expect(isSetFavoredInWells({ 1: ['1'] }, { 1: [] })).toBeTruthy();
      expect(
        isSetFavoredInWells({ 1: [], 2: [] }, { 1: [], 2: [] })
      ).toBeTruthy();
      expect(
        isSetFavoredInWells(
          { 2: ['1', '2', '3'], 1: ['4', '5'] },
          { 1: ['4', '5'], 2: ['1', '2', '3'] }
        )
      ).toBeTruthy();
    });
  });

  describe('isSetFavoredInDocuments', () => {
    it('should calculate favored status correctly', () => {
      expect(isSetFavoredInDocuments(undefined, [1, 2, 3])).toBeFalsy();
      expect(isSetFavoredInDocuments([], [])).toBeFalsy();
      expect(isSetFavoredInDocuments([], [1, 2, 3])).toBeFalsy();
      expect(isSetFavoredInDocuments([1, 2, 3], [])).toBeFalsy();
      expect(isSetFavoredInDocuments([1, 2, 3, 4], [1, 2, 3])).toBeFalsy();

      expect(isSetFavoredInDocuments([2, 3], [1, 2, 3])).toBeTruthy();
      expect(isSetFavoredInDocuments([1, 2, 3], [1, 2, 3])).toBeTruthy();
    });
  });
});
