import { titleFilterList, filterTitle } from '../toDocument';
import { addQueryRefinement } from '../utils';

const validTitleFilterList = [
  'Valid title 1',
  'Valid title 2',
  'Another valid title',
];

describe('utils', () => {
  describe('addQueryRefinement', () => {
    test('or', () => {
      expect(addQueryRefinement('one', 'OR')).toEqual('(one)');
    });

    test('exact', () => {
      expect(addQueryRefinement('two', 'EXACT')).toEqual("'two'");
    });
  });

  describe('filterTitle', () => {
    test.each([titleFilterList])(
      'filter each of the values in the filter list',
      (title) => {
        expect(filterTitle(title)).toEqual('');
      }
    );

    test.each([validTitleFilterList])('do not filter valid titles', (title) => {
      expect(filterTitle(title)).toEqual(title);
    });
  });
});
