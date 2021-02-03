import { isSimilarBoundingBox } from '../AnnotationUtils';

describe('AnnotationUtils', () => {
  describe('isSimilarBoundingBox', () => {
    const origBox = {
      xMin: 100,
      yMin: 100,
      xMax: 200,
      yMax: 200,
    };
    it('the same', () => {
      expect(
        isSimilarBoundingBox(origBox, {
          xMin: 100,
          yMin: 100,
          xMax: 200,
          yMax: 200,
        })
      ).toBe(true);
      expect(isSimilarBoundingBox(origBox, origBox, 0.2, true)).toBe(true);
    });
    it('smaller', () => {
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 110,
            yMin: 110,
            xMax: 190,
            yMax: 190,
          },
          0.2
        )
      ).toBe(true);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 110,
            yMin: 110,
            xMax: 190,
            yMax: 190,
          },
          0.2,
          true
        )
      ).toBe(true);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 110,
            yMin: 110,
            xMax: 190,
            yMax: 190,
          },
          0.05
        )
      ).toBe(false);
    });
    it('bigger', () => {
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 90,
            yMin: 90,
            xMax: 210,
            yMax: 210,
          },
          0.2
        )
      ).toBe(true);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 90,
            yMin: 90,
            xMax: 210,
            yMax: 210,
          },
          0.2,
          true
        )
      ).toBe(false);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 90,
            yMin: 90,
            xMax: 210,
            yMax: 210,
          },
          0.05
        )
      ).toBe(false);
    });
    it('mix', () => {
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 120,
            yMin: 120,
            xMax: 210,
            yMax: 210,
          },
          0.2
        )
      ).toBe(true);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 120,
            yMin: 120,
            xMax: 210,
            yMax: 210,
          },
          0.1
        )
      ).toBe(false);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 120,
            yMin: 120,
            xMax: 210,
            yMax: 210,
          },
          0.2,
          true
        )
      ).toBe(false);
      expect(
        isSimilarBoundingBox(
          origBox,
          {
            xMin: 120,
            yMin: 120,
            xMax: 210,
            yMax: 210,
          },
          0.05
        )
      ).toBe(false);
    });
  });
});
