import {
  MatchResult,
  getMatchResultWithReferences,
  InstanceMatcher,
} from '../InstanceMatcher';
import { svgCommandsToSegments } from '../svgPathParser';
import { PidPath } from '../../pid';

describe('isSimilarWithReferences', () => {
  test('simple L shaped paths (same scale)', () => {
    const path1 = svgCommandsToSegments('M 0,0 l 0,10 l 10,0');
    const path2 = svgCommandsToSegments('M 100,100 l 0,10 l 10,0');

    expect(getMatchResultWithReferences(path1, 0, path2, 0)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 0, path2, 1)).toEqual(
      MatchResult.NotMatch
    );
  });

  test('simple L shaped paths (different scale)', () => {
    const path1 = svgCommandsToSegments('M 0,0 l 0,10 l 10,0');
    const path2 = svgCommandsToSegments('M 100,100 l 0,20 l 20,0');

    expect(getMatchResultWithReferences(path1, 0, path2, 0)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 0, path2, 1)).toEqual(
      MatchResult.NotMatch
    );
  });

  test('simple L shaped paths (different scale & error margin)', () => {
    const path1 = svgCommandsToSegments('M 0,0 l 0,10 l 10,0');
    const path2SmallError = svgCommandsToSegments('M 100,100 l 0,22 l 20,0');

    expect(getMatchResultWithReferences(path1, 0, path2SmallError, 0)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 1, path2SmallError, 1)).toEqual(
      MatchResult.Match
    );

    const path2BigError = svgCommandsToSegments('M 100,100 l 0,26 l 20,0');

    expect(getMatchResultWithReferences(path1, 0, path2BigError, 0)).toEqual(
      MatchResult.NotMatch
    );
    expect(getMatchResultWithReferences(path1, 1, path2BigError, 1)).toEqual(
      MatchResult.NotMatch
    );
  });

  test('simple paths sub match (same scale)', () => {
    const path1 = svgCommandsToSegments('M 0,0 l 0,10 l 10,0 l 0,10');
    const path2 = svgCommandsToSegments('M 100,100 l 0,10 l 10,0');

    expect(getMatchResultWithReferences(path1, 0, path2, 0)).toEqual(
      MatchResult.SubMatch
    );
    expect(getMatchResultWithReferences(path1, 1, path2, 1)).toEqual(
      MatchResult.SubMatch
    );
    expect(getMatchResultWithReferences(path1, 2, path2, 1)).toEqual(
      MatchResult.NotMatch
    );
  });

  test('simple paths ending with Z', () => {
    const closedValve1 = 'M 0,0 l -31,16 l 31,15 z';
    const closedValve2 = 'M 0,0 l -31,-16 l 31,-16 z';

    const path1 = svgCommandsToSegments(closedValve1);
    const path2 = svgCommandsToSegments(closedValve2);

    // path1 index -> path2 index
    //           0 -> 1
    //           1 -> 0
    //           2 -> 2
    expect(getMatchResultWithReferences(path1, 2, path2, 2)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 0, path2, 1)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 1, path2, 0)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 0, path2, 0)).toEqual(
      MatchResult.NotMatch
    );
    expect(getMatchResultWithReferences(path1, 1, path2, 1)).toEqual(
      MatchResult.NotMatch
    );
  });

  test('closed valves', () => {
    const closedValve1 =
      'M 300,250 l -31,16 l 31,15 Z m -62,31 l 31,-15 l -31,-16 Z';
    const closedValve2 =
      'M 450,250 l 31,-15 l -31,-16 Z m 62,-31 l -31,16 l 31,16 Z';
    const path1 = svgCommandsToSegments(closedValve1);
    const path2 = svgCommandsToSegments(closedValve2);

    // path1 index -> path2 index
    //           0 -> 3
    //           1 -> 4
    //           2 -> 5
    //           3 -> 0
    //           4 -> 1
    //           5 -> 2
    expect(getMatchResultWithReferences(path1, 0, path2, 3)).toEqual(
      MatchResult.Match
    );
    expect(getMatchResultWithReferences(path1, 1, path2, 4)).toEqual(
      MatchResult.Match
    );
  });
});

describe('matches', () => {
  test('square match', () => {
    const square1 = 'M 100,100 h 100 v 100 h -100 v -100';
    const square2 = 'M 900,900 h 100 v 100 h -100 v -100';

    const matcher = InstanceMatcher.fromPathCommand(square1);
    const potentialMatch = [PidPath.fromPathCommand(square2)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.Match);
  });

  test('circle and square not match', () => {
    const squareSymbol = 'M 2782,4156 V 4033 H 2906M 2906,4033 V 4156 H 2782';
    const circleSymbol =
      'M 2405,4094.5 C 2405,4128.4653 2377.4656,4156 2343.5,4156 C 2309.5344,4156 2282,4128.4653 2282,4094.5 C 2282,4060.5344 2309.5344,4033 2343.5,4033 C 2377.4656,4033 2405,4060.5344 2405,4094.5';

    const matcher = InstanceMatcher.fromPathCommand(squareSymbol);
    const potentialMatch = [PidPath.fromPathCommand(circleSymbol)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.NotMatch);
  });

  test('closed valve match', () => {
    const closedValve1 =
      'M 300,250 l -31,16 l 31,15 Z m -62,31 l 31,-15 l -31,-16 Z';
    const closedValve2 =
      'M 450,250 l 31,-15 l -31,-16 Z m 62,-31 l -31,16 l 31,16 Z';

    // path1 index -> path2 index
    //           0 -> 5
    //           1 -> 3
    //           2 -> 4
    //           3 -> 1
    //           4 -> 2
    //           5 -> 0
    const matcher = InstanceMatcher.fromPathCommand(closedValve1);
    const potentialMatch = [PidPath.fromPathCommand(closedValve2)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.Match);
  });

  test('file link match', () => {
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

    const matcher = InstanceMatcher.fromPathCommand(fileLink);
    const potentialMatch = [PidPath.fromPathCommand(fileLink2)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.Match);
  });

  test('file link different orientations not match', () => {
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

    const matcher = InstanceMatcher.fromPathCommand(fileLinkUp);
    const potentialMatch = [PidPath.fromPathCommand(fileLinkDown)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.NotMatch);
  });

  test('closed valve sub match', () => {
    const closedValve = [
      'M 4318,2657 L 4349,2642 L 4318,2626 Z',
      'M 4380,2626 L 4349,2642 L 4380,2657 Z',
    ].join(' ');

    const closedValveSubMatch = 'M 4318,2657 L 4349,2642 L 4318,2626 Z';

    const matcher = InstanceMatcher.fromPathCommand(closedValve);
    const potentialMatch = [PidPath.fromPathCommand(closedValveSubMatch)];
    expect(matcher.matches(potentialMatch).match).toEqual(MatchResult.SubMatch);
  });

  test('get unique rotations', () => {
    const valve = [
      'M 4318,2657 L 4349,2642 L 4318,2626 Z',
      'M 4380,2626 L 4349,2642 L 4380,2657 Z',
    ].join(' ');
    const valveMatcher = InstanceMatcher.fromPathCommand(valve);
    const valveRotationMatchers = valveMatcher.getUniqueRotations([
      0, 90, 180, 270,
    ]);
    expect(valveRotationMatchers.length).toEqual(2);
    expect(valveRotationMatchers[0].rotation).toEqual(0);
    expect(valveRotationMatchers[1].rotation).toEqual(90);

    const square = 'M 0,0 L 10,0 L 10,10 L 0,10 Z';
    const squareMatcher = InstanceMatcher.fromPathCommand(square);
    expect(squareMatcher.getUniqueRotations([0, 90, 180, 270]).length).toEqual(
      1
    );

    const triangle = 'M 0,0 L 10,0 L 5,10 Z';
    const triangleMatcher = InstanceMatcher.fromPathCommand(triangle);
    expect(
      triangleMatcher.getUniqueRotations([0, 90, 180, 270]).length
    ).toEqual(4);
  });
});
