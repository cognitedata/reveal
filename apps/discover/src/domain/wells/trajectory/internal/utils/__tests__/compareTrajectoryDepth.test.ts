import { TrajectoryInternal } from '../../types';
import { compareTrajectoryDepth } from '../compareTrajectoryDepth';

type TestTrajectoryType = Pick<
  TrajectoryInternal,
  'maxMeasuredDepth' | 'isDefinitive'
>;

const compare = <T extends TestTrajectoryType>(
  trajectory1: T,
  trajectory2: T
) => {
  return compareTrajectoryDepth(trajectory1, trajectory2, 'maxMeasuredDepth');
};

describe('compareTrajectoryDepth', () => {
  it('should be ok', () => {
    expect(
      compare({ isDefinitive: true }, { isDefinitive: false })
    ).toBeGreaterThan(0);

    expect(
      compare(
        { maxMeasuredDepth: 1000, isDefinitive: false },
        { maxMeasuredDepth: 2000, isDefinitive: true }
      )
    ).toBeGreaterThan(0);

    expect(
      compare(
        { maxMeasuredDepth: 1000, isDefinitive: false },
        { maxMeasuredDepth: 2000, isDefinitive: false }
      )
    ).toBeGreaterThan(0);
  });
});
