import { addQueryRefinement } from '../utils';

describe('utils', () => {
  describe('addQueryRefinement', () => {
    test('or', () => {
      expect(addQueryRefinement('one', 'OR')).toEqual('(one)');
    });

    test('exact', () => {
      expect(addQueryRefinement('two', 'EXACT')).toEqual("'two'");
    });
  });
});
