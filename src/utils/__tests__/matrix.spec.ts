import { mapConfusionMatrix } from '../matrix';

describe('Matrix', () => {
  describe('mapConfusionMatrix', () => {
    test.each([
      // Test 1 - basic test of transmuting values
      [
        [
          [1, 2],
          [0, 2],
        ],
        ['a', 'b'],
        [
          {
            id: 0,
            name: 'a',
            matrix: {
              a: { value: 1, outlier: false },
              b: { value: 2, outlier: true },
            },
          },
          {
            id: 1,
            name: 'b',
            matrix: {
              a: { value: 0, outlier: false },
              b: { value: 2, outlier: false },
            },
          },
        ],
      ],
      // Test 2 - extra column without matching label
      [
        [
          [1, 2, 0],
          [0, 2, 1],
        ],
        ['a', 'b'],
        [
          {
            id: 0,
            name: 'a',
            matrix: {
              a: { value: 1, outlier: false },
              b: { value: 2, outlier: true },
              '?': { value: 0, outlier: false },
            },
          },
          {
            id: 1,
            name: 'b',
            matrix: {
              a: { value: 0, outlier: false },
              b: { value: 2, outlier: false },
              '?': { value: 1, outlier: true },
            },
          },
        ],
      ],
    ])('.matrix(%i, %i)', (confusionMatrix, labels, expected) => {
      const result = mapConfusionMatrix(confusionMatrix, labels);
      expect(result).toMatchObject(expected);
    });
  });
});
