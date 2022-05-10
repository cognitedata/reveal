import { initialState } from 'src/modules/Common/store/annotationV1/slice';
import {
  filesAnnotationCounts,
  makeSelectAnnotationsForFileIds,
  makeSelectFileAnnotations,
  makeSelectFileAnnotationsByType,
  makeSelectTotalAnnotationCountForFileIds,
} from 'src/modules/Common/store/annotationV1/selectors';
import {
  AnnotationStatus,
  AnnotationUtilsV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { RegionShape } from 'src/api/annotation/types';

describe('Test annotation selectors', () => {
  const getDummyAnnotation = (
    id?: number,
    modelType?: number,
    text?: string,
    status: AnnotationStatus = AnnotationStatus.Unhandled
  ) => {
    return AnnotationUtilsV1.createVisionAnnotationStubV1(
      id || 1,
      text || 'pump',
      modelType || 1,
      1,
      123,
      124,
      { shape: RegionShape.Rectangle, vertices: [] },
      RegionShape.Rectangle,
      'user',
      status
    );
  };

  describe('Test makeSelectFileAnnotations', () => {
    const selectFileAnnotations = makeSelectFileAnnotations();

    test('should return empty list when file not part of state', () => {
      expect(selectFileAnnotations(initialState, 1)).toEqual([]);
    });

    test('should return empty list if file has no annotations', () => {
      const previousState = {
        ...initialState,
        files: {
          byId: {
            '10': [],
          },
        },
      };
      expect(
        selectFileAnnotations(previousState, 10).map((item) => item.id)
      ).toEqual([]);
    });

    test('should return annotation for specified file', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
            '2': getDummyAnnotation(2),
          },
        },
      };
      expect(selectFileAnnotations(previousState, 10)).toEqual([
        getDummyAnnotation(1),
      ]);
    });
  });

  describe('Test makeSelectAnnotationsForFileIds', () => {
    const selectAnnotationsForFileIds = makeSelectAnnotationsForFileIds();
    const annotations = [
      getDummyAnnotation(1, 1, 'foo', AnnotationStatus.Verified),
      getDummyAnnotation(2, 1, 'bar', AnnotationStatus.Rejected),
    ];
    const previousState = {
      files: {
        byId: {
          '10': [1],
          '20': [2],
        },
      },
      annotations: {
        byId: {
          '1': annotations[0],
          '2': annotations[1],
        },
      },
    };
    test('should return all annotations for provided file ids', () => {
      expect(selectAnnotationsForFileIds(previousState, [10, 20, 30])).toEqual({
        '10': [annotations[0]],
        '20': [annotations[1]],
        '30': [], // prefer to not raise exception in selectors
      });
    });
    test('should return the annotations filtered by text for provided file ids', () => {
      expect(
        selectAnnotationsForFileIds(previousState, [10, 20, 30], {
          annotationLabelOrText: 'foo',
        })
      ).toEqual({
        '10': [annotations[0]],
        '20': [],
        '30': [],
      });
    });
    test('should return the annotations filtered by status for provided file ids', () => {
      expect(
        selectAnnotationsForFileIds(previousState, [10, 20, 30], {
          annotationState: AnnotationStatus.Rejected,
        })
      ).toEqual({
        '10': [],
        '20': [annotations[1]],
        '30': [],
      });
    });
  });

  describe('Test makeSelectFileAnnotationsByType', () => {
    const selectFileAnnotationsByType = makeSelectFileAnnotationsByType();

    test('should select annotations with specified type', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, 1),
            '2': getDummyAnnotation(2, 2),
          },
        },
      };
      // select annotations for file id 10 with model type 1
      expect(selectFileAnnotationsByType(previousState, 10, [1])).toEqual([
        getDummyAnnotation(1, 1),
      ]);
    });
  });

  describe('Test filesAnnotationCounts', () => {
    test('should return number of annotations for each file', () => {
      const previousState = {
        ...initialState,
        files: {
          byId: {
            '10': [1, 2],
            '20': [3],
          },
        },
      };
      expect(filesAnnotationCounts(previousState, [10, 20])).toEqual({
        '10': 2,
        '20': 1,
      });
    });
  });

  describe('Test annotation count selectors', () => {
    const previousState = {
      ...initialState,
      files: {
        byId: {
          '10': [1, 2, 3, 5],
          '20': [3, 4],
        },
      },
      annotations: {
        byId: {
          '1': getDummyAnnotation(1, VisionDetectionModelType.OCR),
          '2': getDummyAnnotation(2, VisionDetectionModelType.TagDetection),
          '3': getDummyAnnotation(3, VisionDetectionModelType.ObjectDetection),
          '4': getDummyAnnotation(
            4,
            VisionDetectionModelType.ObjectDetection,
            'hose'
          ),
          '5': getDummyAnnotation(
            5,
            VisionDetectionModelType.ObjectDetection,
            'person'
          ),
        },
      },
    };

    describe('Test makeSelectTotalAnnotationCountForFileIds', () => {
      test('should return annotation counts for all annotations of provided file ids', () => {
        const selectTotalAnnotationCounts =
          makeSelectTotalAnnotationCountForFileIds();

        expect(selectTotalAnnotationCounts(previousState, [10])).toEqual({
          objects: 1,
          assets: 1,
          text: 1,
          gdpr: 1,
          mostFrequentObject: ['pump', 1],
        });
      });
    });
  });
});
