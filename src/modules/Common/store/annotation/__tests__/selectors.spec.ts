import { initialState } from 'src/modules/Common/store/annotation/slice';
import {
  filesAnnotationCounts,
  makeSelectAnnotationCounts,
  makeSelectAnnotationsForFileIds,
  makeSelectFileAnnotations,
  makeSelectFileAnnotationsByType,
  makeSelectTotalAnnotationCounts,
  selectAllAnnotations,
} from 'src/modules/Common/store/annotation/selectors';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';

describe('Test annotation selectors', () => {
  const getDummyAnnotation = (
    id?: number,
    modelType?: number,
    text?: string
  ) => {
    return AnnotationUtils.createVisionAnnotationStub(
      id || 1,
      text || 'pump',
      modelType || 1,
      1,
      123,
      124,
      { shape: 'rectangle', vertices: [] }
    );
  };

  describe('Test makeSelectFileAnnotations', () => {
    const selector = makeSelectFileAnnotations();

    test('should return empty list when file not part of state', () => {
      expect(selector(initialState, 1)).toEqual([]);
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
      expect(selector(previousState, 10).map((item) => item.id)).toEqual([]);
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
      expect(selector(previousState, 10)).toEqual([getDummyAnnotation(1)]);
    });
  });

  describe('Test selectAllAnnotations', () => {
    test('should return empty list if no annotations available', () => {
      expect(selectAllAnnotations(initialState)).toEqual([]);
    });

    test('should return all available annotations', () => {
      const previousState = {
        ...initialState,
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
            '2': getDummyAnnotation(2),
          },
        },
      };
      expect(selectAllAnnotations(previousState)).toEqual([
        getDummyAnnotation(1),
        getDummyAnnotation(2),
      ]);
    });
  });

  describe('Test makeSelectAnnotationsForFileIds', () => {
    const selector = makeSelectAnnotationsForFileIds();
    test('should return all annotations for all files', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
            '20': [2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
            '2': getDummyAnnotation(2),
          },
        },
      };
      expect(selector(previousState, [10, 20, 30])).toEqual({
        '10': [getDummyAnnotation(1)],
        '20': [getDummyAnnotation(2)],
        '30': [], // prefer to not raise exception in selectors
      });
    });
  });

  describe('Test makeSelectFileAnnotationsByType', () => {
    const selector = makeSelectFileAnnotationsByType();

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
      expect(selector(previousState, 10, [1])).toEqual([
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

  describe('Test makeSelectAnnotationCounts', () => {
    test('should return annotation counts for each file', () => {
      const previousState = {
        ...initialState,
        files: {
          byId: {
            '10': [1, 2, 3, 4],
            '20': [3, 4],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, VisionAPIType.OCR),
            '2': getDummyAnnotation(2, VisionAPIType.TagDetection),
            '3': getDummyAnnotation(3, VisionAPIType.ObjectDetection),
            '4': getDummyAnnotation(4, VisionAPIType.ObjectDetection, 'person'),
          },
        },
      };

      const selector = makeSelectAnnotationCounts();

      // eslint-disable-next-line no-debugger
      debugger;

      expect(selector(previousState, 10)).toEqual({
        objects: 1,
        assets: 1,
        text: 1,
        gdpr: 1,
        mostFrequentObject: ['pump', 1],
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
          '1': getDummyAnnotation(1, VisionAPIType.OCR),
          '2': getDummyAnnotation(2, VisionAPIType.TagDetection),
          '3': getDummyAnnotation(3, VisionAPIType.ObjectDetection),
          '4': getDummyAnnotation(4, VisionAPIType.ObjectDetection, 'hose'),
          '5': getDummyAnnotation(5, VisionAPIType.ObjectDetection, 'person'),
        },
      },
    };

    describe('Test makeSelectAnnotationCounts', () => {
      test('should return annotation counts for each file', () => {
        const selector = makeSelectAnnotationCounts();

        expect(selector(previousState, 10)).toEqual({
          objects: 1,
          assets: 1,
          text: 1,
          gdpr: 1,
          mostFrequentObject: ['pump', 1],
        });
      });
    });

    describe('Test makeSelectTotalAnnotationCounts', () => {
      test('should return annotation counts for all annotations of all files', () => {
        const selector = makeSelectTotalAnnotationCounts();

        expect(selector(previousState)).toEqual({
          objects: 2,
          assets: 1,
          text: 1,
          gdpr: 1,
          mostFrequentObject: ['hose', 1],
        });
      });
    });
  });
});
