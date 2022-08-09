import reducer, {
  initialState,
  setReviewFileIds,
} from 'src/modules/Review/store/review/slice';
import { ReviewState } from 'src/modules/Review/store/review/types';

const mockReviewState: ReviewState = {
  ...initialState,
};

describe('Test review slice', () => {
  describe('Test actions', () => {
    describe('action setReviewFileIds', () => {
      test('Should set new input file ids as state file ids', () => {
        const newState = reducer(mockReviewState, setReviewFileIds([1, 2, 3]));
        expect(newState.fileIds).toEqual([1, 2, 3]);
      });

      test('can set file ids back to empty array', () => {
        const newState = reducer(mockReviewState, setReviewFileIds([]));
        expect(newState.fileIds).toEqual([]);
      });
    });
  });
});
