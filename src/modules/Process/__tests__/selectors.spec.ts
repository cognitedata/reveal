import {
  initialState,
  selectUnfinishedJobs,
} from 'src/modules/Process/processSlice';

describe('Test selectUnfinishedJobs', () => {
  test('should return empty list if no jobs started', () => {
    expect(selectUnfinishedJobs(initialState)).toEqual([]);
  });
});
