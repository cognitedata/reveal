import reducer, {
  initialState,
  resetPreview,
  selectAnnotation,
  setReviewFileIds,
  setScrollToId,
  showAnnotationSettingsModel,
  toggleAnnotationVisibility,
} from 'src/modules/Review/store/review/slice';
import { ReviewState } from 'src/modules/Review/store/review/types';
import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';

const mockReviewState: ReviewState = {
  ...initialState,
  fileIds: [100, 200, 300],
  hiddenAnnotationIds: [1, 2, 3],
  selectedAnnotationIds: [4, 5, 6],
};

describe('Test review slice', () => {
  describe('Test reducers', () => {
    describe('setReviewFileIds reducer', () => {
      test('Should set new input file ids as state file ids', () => {
        const newState = reducer(mockReviewState, setReviewFileIds([1, 2, 3]));
        expect(newState.fileIds).toEqual([1, 2, 3]);
      });

      test('can set file ids back to empty array', () => {
        const newState = reducer(mockReviewState, setReviewFileIds([]));
        expect(newState.fileIds).toEqual([]);
      });
    });

    describe('toggleAnnotationVisibility reducer', () => {
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

    describe('selectAnnotation reducer', () => {
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

    describe('showAnnotationSettingsModel reducer', () => {
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

    describe('setScrollToId reducer', () => {
      test('set scroll To Id', () => {
        const newState = reducer(mockReviewState, setScrollToId('3'));
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
        const newState = reducer(mockReviewState, setScrollToId(''));
        expect(newState.scrollToId).toStrictEqual('');
      });
    });

    describe('resetPreview reducer', () => {
      test('reset selected annotation ids and hidden annotation ids', () => {
        const newState = reducer(mockReviewState, resetPreview());
        expect(newState).toStrictEqual({
          ...mockReviewState,
          selectedAnnotationIds: [],
          hiddenAnnotationIds: [],
        });
      });
    });
  });

  describe('Test extra reducers', () => {
    describe('deselectAllSelectionsReviewPage reducer', () => {
      test('deselectAllSelectionsReviewPage resets the select and scroll ids', () => {
        const action = {
          type: deselectAllSelectionsReviewPage,
        };
        const newState = reducer(
          {
            ...mockReviewState,
            selectedAnnotationIds: [1],
            scrollToId: 'element_id',
          },
          action
        );
        expect(newState.selectedAnnotationIds).toStrictEqual([]);
        expect(newState.scrollToId).toStrictEqual('');
      });
    });
  });
});
