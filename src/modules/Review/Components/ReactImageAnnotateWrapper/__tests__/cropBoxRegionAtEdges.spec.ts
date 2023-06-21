import { cropEdge } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/utils/cropBoxRegionAtEdges';

describe('test cropEdge fn', () => {
  describe('if started right side or below the image', () => {
    /**
     * if start is grater than 1
     * user has internationally create the annotation outside the image
     * annotation will not created with api error
     */
    const start = 1.5;
    test('for any length', () => {
      const length = 0.5;
      expect(cropEdge(start, length)).toEqual({ start, length });
    });
  });

  describe('if started inside the image', () => {
    // if start is between 0 and 1
    const start = 0.25;

    test('if ends outside the image', () => {
      // need to crop
      const length = 1;
      expect(cropEdge(start, length)).toEqual({ start, length: 0.75 });
    });

    test('if ends inside the image the image', () => {
      // no need for a crop
      const length = 0.5;
      expect(cropEdge(start, length)).toEqual({ start, length });
    });
  });

  describe('if started left side or above the image', () => {
    // if start is negative
    const start = -0.3;

    test('if end before the image', () => {
      const length = 0.1;
      /**
       * user has internationally create the annotation outside the image
       * annotation will not created with api error
       */
      expect(cropEdge(start, length)).toEqual({ start, length });
    });

    test('if ends inside the image', () => {
      const length = 0.5;
      // need to crop

      expect(cropEdge(start, length)).toEqual({ start: 0, length: 0.2 });
    });

    test('if ends inside the image while length grater than 1', () => {
      const length = 1.1;
      // need to crop

      expect(cropEdge(start, length)).toEqual({ start: 0, length: 0.8 });
    });

    test('if end after the image', () => {
      const length = 1.5;
      // need to crop

      expect(cropEdge(start, length)).toEqual({ start: 0, length: 1 });
    });
  });
});
