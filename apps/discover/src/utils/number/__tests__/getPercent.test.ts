import { getFixedPercent } from '../getPercent';

describe('getFixedPercent', () => {
  test('whole numbers', () => {
    expect(getFixedPercent(1, 2)).toEqual(50);
  });
  test('fractions', () => {
    expect(getFixedPercent(1, 3)).toEqual(33);
  });
  test('greated than 100', () => {
    expect(getFixedPercent(2, 1)).toEqual(200);
  });
  test('failures - Infinity', () => {
    expect(getFixedPercent(1, 0)).toEqual(0);
  });
  test('failures - 0', () => {
    expect(getFixedPercent(0, 0)).toEqual(0);
  });
});
