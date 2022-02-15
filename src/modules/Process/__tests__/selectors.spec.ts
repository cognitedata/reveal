import { initialState } from 'src/modules/Process/store/slice';
import { selectUnfinishedJobs } from 'src/modules/Process/store/selectors';

describe('Test selectUnfinishedJobs', () => {
  test('should return empty list if no jobs started', () => {
    expect(selectUnfinishedJobs(initialState)).toEqual([]);
  });
});
