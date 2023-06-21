import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import reducer, {
  annotationDetailPanelInitialState,
  AnnotationDetailPanelState,
  selectAnnotationCategory,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/store/slice';

describe('Test AnnotationDetailPanel reducer', () => {
  const state: AnnotationDetailPanelState = {
    annotationCategories: {
      [CDFAnnotationTypeEnum.ImagesAssetLink]: { selected: true },
    },
  };
  const stateWithTextCategory: AnnotationDetailPanelState = {
    annotationCategories: {
      [CDFAnnotationTypeEnum.ImagesTextRegion]: { selected: true },
    },
  };

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(
      annotationDetailPanelInitialState
    );
  });

  describe('Test selectAnnotationCategory reducer', () => {
    test('should select the category', () => {
      expect(
        reducer(
          annotationDetailPanelInitialState,
          selectAnnotationCategory({
            annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
            selected: true,
          })
        )
      ).toEqual({
        annotationCategories: {
          [CDFAnnotationTypeEnum.ImagesAssetLink]: { selected: true },
        },
      });
    });
    test('should remove the category', () => {
      expect(
        reducer(
          state,
          selectAnnotationCategory({
            annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
            selected: false,
          })
        )
      ).toEqual(annotationDetailPanelInitialState);
    });
    test('should replace the existing category', () => {
      expect(
        reducer(
          state,
          selectAnnotationCategory({
            annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
            selected: true,
          })
        )
      ).toEqual(stateWithTextCategory);
    });
    test('should not add same selected category', () => {
      expect(
        reducer(
          state,
          selectAnnotationCategory({
            annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
            selected: true,
          })
        )
      ).toEqual(state);
    });
    test('do nothing on removing invalid category', () => {
      expect(
        reducer(
          state,
          selectAnnotationCategory({
            annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
            selected: false,
          })
        )
      ).toEqual(state);
    });
  });
});
