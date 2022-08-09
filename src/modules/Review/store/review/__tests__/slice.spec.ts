import reducer, {
  initialState,
  selectAnnotation,
  setReviewFileIds,
  setScrollToId,
  showAnnotationSettingsModel,
  toggleAnnotationVisibility,
} from 'src/modules/Review/store/review/slice';
import { ReviewState } from 'src/modules/Review/store/review/types';
import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';

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

    describe('action showAnnotationSettingsModel', () => {
      describe('open annotation settings without create new', () => {
        test('open shape annotation settings', () => {
          const newState = reducer(
            mockReviewState,
            showAnnotationSettingsModel(true, AnnotationSettingsOption.SHAPE)
          );
          expect(newState.annotationSettings).toStrictEqual({
            show: true,
            activeView: AnnotationSettingsOption.SHAPE,
            createNew: { text: undefined, color: undefined },
          });
        });

        test('open keypoint annotation settings', () => {
          const newState = reducer(
            mockReviewState,
            showAnnotationSettingsModel(true, AnnotationSettingsOption.KEYPOINT)
          );
          expect(newState.annotationSettings).toStrictEqual({
            show: true,
            activeView: AnnotationSettingsOption.KEYPOINT,
            createNew: { text: undefined, color: undefined },
          });
        });
      });

      describe('open annotation settings modal when try to add non existing one', () => {
        test('add new shape', () => {
          const newState = reducer(
            mockReviewState,
            showAnnotationSettingsModel(
              true,
              AnnotationSettingsOption.SHAPE,
              'new_shape',
              'red'
            )
          );
          expect(newState.annotationSettings).toStrictEqual({
            show: true,
            activeView: AnnotationSettingsOption.SHAPE,
            createNew: { text: 'new_shape', color: 'red' },
          });
        });

        test('add new keypoint', () => {
          const newState = reducer(
            mockReviewState,
            showAnnotationSettingsModel(
              true,
              AnnotationSettingsOption.KEYPOINT,
              'new_shape',
              'red'
            )
          );
          expect(newState.annotationSettings).toStrictEqual({
            show: true,
            activeView: AnnotationSettingsOption.KEYPOINT,
            createNew: { text: 'new_shape', color: 'red' },
          });
        });
      });

      describe('hide annotation settings modal', () => {
        test('add new keypoint', () => {
          const newState = reducer(
            {
              ...mockReviewState,
              annotationSettings: {
                show: false,
                activeView: AnnotationSettingsOption.SHAPE,
                createNew: { text: 'new_shape', color: 'red' },
              },
            },
            showAnnotationSettingsModel(false)
          );
          expect(newState.annotationSettings).toStrictEqual({
            show: false,
            activeView: AnnotationSettingsOption.SHAPE,
            createNew: { text: undefined, color: undefined },
          });
        });
      });
    });

    describe('action setScrollToId', () => {
      test('set scroll To Id', () => {
        const newState = reducer(
          {
            ...mockReviewState,
          },
          setScrollToId('3')
        );
        expect(newState.scrollToId).toStrictEqual('3');
      });

      test('change scroll To Id', () => {
        const newState = reducer(
          {
            ...mockReviewState,
            scrollToId: '2',
          },
          setScrollToId('3')
        );
        expect(newState.scrollToId).toStrictEqual('3');
      });

      test('remove scroll To Id', () => {
        const newState = reducer(
          {
            ...mockReviewState,
          },
          setScrollToId('')
        );
        expect(newState.scrollToId).toStrictEqual('');
      });
    });
  });
});
