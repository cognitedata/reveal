import { getOverflownElementsInfo } from '_helpers/getOverflownElementsInfo';

describe('getOverflownElementsInfo', () => {
  test('should return overflown elements info', () => {
    const ref = {
      current: {
        offsetLeft: 10,
        offsetWidth: 990,
        childNodes: [
          {
            offsetLeft: 10,
            offsetWidth: 90,
          },
          {
            offsetLeft: 10,
            offsetWidth: 490,
          },
          {
            offsetLeft: 10,
            offsetWidth: 590,
          },
        ],
      },
    };
    expect(getOverflownElementsInfo(ref as any)).toEqual({
      lastIndex: 2,
      lastOffset: 600,
    });
  });

  test('should ignore specified elements and return overflown elements info', () => {
    const ref = {
      current: {
        offsetLeft: 10,
        offsetWidth: 990,
        childNodes: [
          {
            offsetLeft: 10,
            offsetWidth: 90,
          },
          {
            id: 'hidden-count',
            offsetLeft: 10,
            offsetWidth: 90,
          },
          {
            offsetLeft: 10,
            offsetWidth: 490,
          },
          {
            offsetLeft: 10,
            offsetWidth: 590,
          },
        ],
      },
    };
    expect(getOverflownElementsInfo(ref as any, ['hidden-count'])).toEqual({
      lastIndex: 2,
      lastOffset: 600,
    });
  });
});
