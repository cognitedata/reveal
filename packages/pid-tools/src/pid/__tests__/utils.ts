import { PidPath } from '../PidPath';
import { calculatePidPathsBoundingBox } from '../utils';

describe('calculatePidPathsBoundingBox', () => {
  test('simple vertical, horizontal line', () => {
    const path1 = PidPath.fromPathCommand('M 0,0 V 50');
    const path2 = PidPath.fromPathCommand('M 0,0 H 50');

    const expectedBBox = { x: 0, y: 0, width: 50, height: 50 };
    expect(calculatePidPathsBoundingBox([path1, path2])).toEqual(expectedBBox);
  });
});
