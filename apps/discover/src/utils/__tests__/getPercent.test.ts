import { getPercent } from '../getPercent';

describe('getPercent', () => {
  test('whole numbers', () => {
    expect(getPercent(1, 2)).toEqual(50);
  });
  test('fractions', () => {
    expect(getPercent(1, 3)).toEqual(33);
  });
  test('greated than 100', () => {
    expect(getPercent(2, 1)).toEqual(200);
  });
  test('failures - Infinity', () => {
    expect(getPercent(1, 0)).toEqual(0);
  });
  test('failures - 0', () => {
    expect(getPercent(0, 0)).toEqual(0);
  });
});
