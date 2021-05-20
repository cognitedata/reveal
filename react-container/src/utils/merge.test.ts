import { mergeConfiguration } from './merge';

describe('merge', () => {
  describe('mergeConfiguration', () => {
    it('should give priority to second object', () => {
      expect(
        mergeConfiguration(
          {
            a: 1,
            b: 4,
          },
          {
            b: 2,
            c: 3,
          }
        )
      ).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });
  });
});
