import { newMatcher } from '../index';

describe('symbol-matching', () => {
  test('connectionSymbol from same file', () => {
    const connectionSymbol1 =
      'M 1921,4954 V 5385 L 1875,5447 L 1829,5385M 1921,5247 H 1829M 1829,4954 V 5385M 1921,4954 L 1875,4985 L 1829,4954';
    const connectionSymbol2 =
      'M 1580,4954 V 5385 L 1534,5447 L 1488,5385M 1580,5247 H 1488M 1488,4954 V 5385M 1580,4954 L 1534,4985 L 1488,4954';

    const matcher1 = newMatcher(connectionSymbol1);
    const matcher2 = newMatcher(connectionSymbol2);
    expect(matcher1.matches(matcher2)).toEqual(matcher1.segmentList.length);
  });

  test('circle and square', () => {
    const squareSymbol = 'M 2782,4156 V 4033 H 2906M 2906,4033 V 4156 H 2782';
    const circleSymbol =
      'M 2405,4094.5 C 2405,4128.4653 2377.4656,4156 2343.5,4156 C 2309.5344,4156 2282,4128.4653 2282,4094.5 C 2282,4060.5344 2309.5344,4033 2343.5,4033 C 2377.4656,4033 2405,4060.5344 2405,4094.5';

    const matcher1 = newMatcher(squareSymbol);
    const matcher2 = newMatcher(circleSymbol);
    expect(matcher1.matches(matcher2)).toEqual(0);
  });

  test('mutifile square', () => {
    const squareSymbol = 'M 2782,4156 V 4033 H 2906M 2906,4033 V 4156 H 2782';
    const squareFile2Symbol =
      'M 11130,16624 V 16131 H 11623M 11623,16131 V 16624 H 11130';

    const matcher1 = newMatcher(squareSymbol);
    const matcher2 = newMatcher(squareFile2Symbol);
    expect(matcher1.matches(matcher2)).toEqual(matcher1.segmentList.length);
  });
});
