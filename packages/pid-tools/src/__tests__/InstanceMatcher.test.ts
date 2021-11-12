import { newMatcher } from '../index';
import { MatchResult } from '../InstanceMatcher';

describe('symbol-matching', () => {
  test('connectionSymbol from same file', () => {
    const connectionSymbol1 =
      'M 1921,4954 V 5385 L 1875,5447 L 1829,5385M 1921,5247 H 1829M 1829,4954 V 5385M 1921,4954 L 1875,4985 L 1829,4954';
    const connectionSymbol2 =
      'M 1580,4954 V 5385 L 1534,5447 L 1488,5385M 1580,5247 H 1488M 1488,4954 V 5385M 1580,4954 L 1534,4985 L 1488,4954';

    const matcher1 = newMatcher(connectionSymbol1);
    const matcher2 = newMatcher(connectionSymbol2);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.Match);
  });

  test('circle and square', () => {
    const squareSymbol = 'M 2782,4156 V 4033 H 2906M 2906,4033 V 4156 H 2782';
    const circleSymbol =
      'M 2405,4094.5 C 2405,4128.4653 2377.4656,4156 2343.5,4156 C 2309.5344,4156 2282,4128.4653 2282,4094.5 C 2282,4060.5344 2309.5344,4033 2343.5,4033 C 2377.4656,4033 2405,4060.5344 2405,4094.5';

    const matcher1 = newMatcher(squareSymbol);
    const matcher2 = newMatcher(circleSymbol);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.NotMatch);
  });

  test('paths ending with Z', () => {
    const closedValve =
      'M 3111,2503 L 3080,2519 L 3111,2534 Z M 3049,2534 L 3080,2519 L 3049,2503 Z';
    const closedValve2 =
      'M 4318,2657 L 4349,2642 L 4318,2626 Z M 4380,2626 L 4349,2642 L 4380,2657 Z';

    const matcher1 = newMatcher(closedValve);
    const matcher2 = newMatcher(closedValve2);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.Match);
  });

  test('file link', () => {
    const fileLink = [
      'M 737,2842 L 706,2889 L 737,2935 H 305',
      'M 305,2842 L 243,2889 L 305,2935',
      'M 305,2842 H 737',
      'M 552,2842 V 2935',
    ].join(' ');

    const fileLink2 = [
      'M 7611,3952 H 8043 L 8012,3998 L 8043,4044 H 7611',
      'M 7611,3952 L 7549,3998 L 7611,4044',
      'M 7842,3952 V 4044',
    ].join(' ');

    const matcher1 = newMatcher(fileLink);
    const matcher2 = newMatcher(fileLink2);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.Match);
  });

  test('file link different orientations', () => {
    const fileLinkUp = [
      'M 1488,4954 V 5385',
      'M 1580,4954 L 1534,4985 L 1488,4954',
      'M 1580,4954 V 5385 L 1534,5447 L 1488,5385',
      'M 1580,5247 H 1488',
    ].join(' ');

    const fileLinkDown = [
      'M 3557,5015 L 3511,4954 L 3465,5015',
      'M 3557,5015 V 5447 L 3511,5416 L 3465,5447 V 5015',
      'M 3557,5247 H 3465',
    ].join(' ');

    const matcher1 = newMatcher(fileLinkUp);
    const matcher2 = newMatcher(fileLinkDown);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.NotMatch);
  });

  test('closed valve sub match', () => {
    const closedValve = [
      'M 4318,2657 L 4349,2642 L 4318,2626 Z',
      'M 4380,2626 L 4349,2642 L 4380,2657 Z',
    ].join(' ');

    const closedValveSubMatch = ['M 4318,2657 L 4349,2642 L 4318,2626 Z'].join(
      ' '
    );

    const matcher1 = newMatcher(closedValve);
    const matcher2 = newMatcher(closedValveSubMatch);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.SubMatch);
  });
});

describe('isTooSpreadOut', () => {
  test('simple lines too spread out', () => {
    // Simple too spread out
    const symbol = ['M 0,0 V 100', 'M 50,0 V 100', 'M 100,0 V 100'].join(' ');
    const matcher1 = newMatcher(symbol);

    const spreadOutSymbol = ['M 0,0 V 100', 'M 121,0 V 100'].join(' ');
    const matcher2 = newMatcher(spreadOutSymbol);
    expect(matcher1.isTooSpreadOut(matcher2)).toEqual(true);
  });

  test('simple lines not too spread out', () => {
    // Simple too spread out
    const symbol = ['M 0,0 V 100', 'M 50,0 V 100', 'M 100,0 V 100'].join(' ');
    const matcher1 = newMatcher(symbol);

    const notSpreadOutSymbol = ['M 0,0 V 100', 'M 79,0 V 100'].join(' ');
    const matcher2 = newMatcher(notSpreadOutSymbol);
    expect(matcher1.isTooSpreadOut(matcher2)).toEqual(false);
  });

  test('instrument too spread out (wrong placement of circle)', () => {
    const instrument = [
      'M 2520,4094 H 2643',
      'M 2643,4094.5 C 2643,4128.4653 2615.4656,4156 2581.5,4156 C 2547.5344,4156 2520,4128.4653 2520,4094.5 C 2520,4060.5344 2547.5344,4033 2581.5,4033 C 2615.4656,4033 2643,4060.5344 2643,4094.5',
      'M 2520,4156 V 4033 H 2643',
      'M 2643,4033 V 4156 H 2520',
    ].join(' ');

    const instrumentWrongCircle = [
      'M 3881,2704.5 C 3881,2738.4656 3853.4656,2766 3819.5,2766 C 3785.5344,2766 3758,2738.4656 3758,2704.5 C 3758,2670.5344 3785.5344,2643 3819.5,2643 C 3853.4656,2643 3881,2670.5344 3881,2704.5',
      'M 3973,3135 V 3012 H 4097',
      'M 3973,3074 H 4097',
      'M 4097,3012 V 3135 H 3973',
    ].join('');

    const matcher1 = newMatcher(instrument);
    const matcher2 = newMatcher(instrumentWrongCircle);
    expect(matcher1.matches(matcher2)).toEqual(MatchResult.NotMatch);
  });
});
