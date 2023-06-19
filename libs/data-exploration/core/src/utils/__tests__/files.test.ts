import {
  fileWithExtentionAndMimeType,
  fileWithExtention,
  fileWithMimeType,
  fileWithoutExtentionAndMimeType,
  CORRECT_TYPE,
  INCORRECT_TYPE,
} from '../../fixtures';
import { isFileOfType } from '../files';

describe('isFileOfType', () => {
  describe('When file have extention', () => {
    describe('when file have mime type', () => {
      // file have both extention and mime type
      it('should return true if both extention and mime type match', () => {
        expect(isFileOfType(fileWithExtentionAndMimeType, [CORRECT_TYPE])).toBe(
          true
        );
      });
    });
    describe("when file don't have mime type", () => {
      it('should return true if extention match', () => {
        expect(isFileOfType(fileWithExtention, [CORRECT_TYPE])).toBe(true);
      });
      it("should return false if extention don't match", () => {
        expect(isFileOfType(fileWithExtention, [INCORRECT_TYPE])).toBe(false);
      });
    });
  });

  describe("When file don't have extention", () => {
    describe('when file have mime type', () => {
      it('should return true if mime type match', () => {
        expect(isFileOfType(fileWithMimeType, [CORRECT_TYPE])).toBe(true);
      });
      it("should return false if mime type don't match", () => {
        expect(isFileOfType(fileWithMimeType, [INCORRECT_TYPE])).toBe(false);
      });
    });

    describe("when file don't have mime type", () => {
      // file don't have both extention and mime type
      expect(
        isFileOfType(fileWithoutExtentionAndMimeType, [CORRECT_TYPE])
      ).toBe(false);
    });
  });

  it('should return false for empty file type array', () => {
    expect(isFileOfType(fileWithExtentionAndMimeType, [])).toBe(false);
  });
});
