import reducer, {
  initialState,
  selectAnnotation,
  setReviewFileIds,
  toggleAnnotationVisibility,
} from 'src/modules/Review/store/review/slice';
import { ReviewState } from 'src/modules/Review/store/review/types';

const mockReviewState: ReviewState = {
  ...initialState,
  hiddenAnnotationIds: [1, 2, 3],
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

    describe('action toggleAnnotationVisibility', () => {
      test("remove id from hidden id if it's already exist", () => {
        const newState = reducer(
          mockReviewState,
          toggleAnnotationVisibility({ annotationId: 3 })
        );
        expect(newState.hiddenAnnotationIds).toEqual([1, 2]);
      });

      test("add annotation id to hidden ids if it's not previously added", () => {
        const newState = reducer(
          mockReviewState,
          toggleAnnotationVisibility({ annotationId: 4 })
        );
        expect(newState.hiddenAnnotationIds).toEqual([1, 2, 3, 4]);
      });
    });

    describe('action selectAnnotation', () => {
      test('set selected annotation id', () => {
        const newState = reducer(mockReviewState, selectAnnotation(4));
        expect(newState.selectedAnnotationIds).toEqual([4]);
      });

      test('change selected annotation id', () => {
        const newState = reducer(
          { ...mockReviewState, selectedAnnotationIds: [3] },
          selectAnnotation(4)
        );
        expect(newState.selectedAnnotationIds).toEqual([4]);
      });
    });
  });
});
