import { DEFAULT_DOCMENT_TITLE, titleFilterList, getTitle } from '../getTitle';

describe('getTitle', () => {
  test.each([titleFilterList])(
    'filter each of the values in the filter list',
    (title) => {
      // @ts-expect-error - faking a doc by just passing in title
      expect(getTitle({ title })).toEqual(DEFAULT_DOCMENT_TITLE);
    }
  );

  const validTitleFilterList = [
    'Valid title 1',
    'Valid title 2',
    'Another valid title',
  ];
  test.each([validTitleFilterList])('do not filter valid titles', (title) => {
    // @ts-expect-error - faking a doc by just passing in title
    expect(getTitle({ title })).toEqual(title);
  });

  test('empty', () => {
    // @ts-expect-error - just incase title is not there
    expect(getTitle({})).toBe(DEFAULT_DOCMENT_TITLE);
  });
});
