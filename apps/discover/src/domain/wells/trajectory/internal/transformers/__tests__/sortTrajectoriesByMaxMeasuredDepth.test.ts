import { sortTrajectoriesByMaxMeasuredDepth } from '../sortTrajectoriesByMaxMeasuredDepth';

describe('sortTrajectoriesByMaxMeasuredDepth', () => {
  it('should sort descending', () => {
    const trajectory1 = { maxMeasuredDepth: 2000, isDefinitive: true };
    const trajectory2 = { maxMeasuredDepth: 1000, isDefinitive: false };
    const trajectory3 = { isDefinitive: false };

    expect(
      sortTrajectoriesByMaxMeasuredDepth([
        trajectory3,
        trajectory1,
        trajectory2,
      ])
    ).toEqual([trajectory1, trajectory2, trajectory3]);
  });
});
