import { addQueryRefinement } from '../utils';

describe('utils', () => {
  describe('addQueryRefinement', () => {
    test('or', () => {
      expect(addQueryRefinement('one', 'OR')).toEqual('(one)');
    });

    test('exact', () => {
      expect(addQueryRefinement('two', 'EXACT')).toEqual("'two'");
    });

    test('other than exact/or', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore to test edge-case
      expect(addQueryRefinement('one', 'Test')).toEqual('one');
    });
  });
});
