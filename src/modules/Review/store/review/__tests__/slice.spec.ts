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
import {
  deselectAllSelectionsReviewPage,
  clearFileState,
} from 'src/store/commonActions';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';

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

    describe('DeleteAnnotations fulfilled action', () => {
      test('Delete fulfill remove ids from selected ids', () => {
        const action = {
          type: DeleteAnnotations.fulfilled,
          meta: { arg: [{ id: 4 }] },
        };
        const newState = reducer(mockReviewState, action);
        expect(newState.selectedAnnotationIds).not.toContain(4);
      });

      test('Delete fulfill remove ids from hidden ids', () => {
        const action = {
          type: DeleteAnnotations.fulfilled,
          meta: { arg: [{ id: 1 }] },
        };
        const newState = reducer(mockReviewState, action);
        expect(newState.hiddenAnnotationIds).not.toContain(1);
      });

      test('Delete fullfil remove ids from selected and hidden ids', () => {
        const action = {
          type: DeleteAnnotations.fulfilled,
          meta: { arg: [{ id: 2 }, { id: 5 }] },
        };
        const newState = reducer(mockReviewState, action);
        expect(newState.selectedAnnotationIds).not.toContain(2);
        expect(newState.hiddenAnnotationIds).not.toContain(5);
      });
    });

    describe('DeleteFilesById fulfilled matcher', () => {
      const actionTypes = [DeleteFilesById.fulfilled.type, clearFileState.type];
      test('Delete fullfil removes file ids', () => {
        actionTypes.forEach((actionType) => {
          const action = {
            type: actionType,
            payload: [100, 200],
          };
          const newState = reducer(mockReviewState, action);

          expect(newState.fileIds).not.toContain(100);
          expect(newState.fileIds).not.toContain(200);
          expect(newState.fileIds).toContain(300);
        });
      });
    });
  });
});
