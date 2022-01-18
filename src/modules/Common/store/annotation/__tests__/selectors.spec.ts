import { initialState } from 'src/modules/Common/store/annotation/slice';
import {
  filesAnnotationCounts,
  selectAllAnnotations,
  selectAnnotationsForAllFiles,
  selectFileAnnotations,
  selectFileAnnotationsByType,
} from 'src/modules/Common/store/annotation/selectors';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';

describe('Test annotation selectors', () => {
  const getDummyAnnotation = (id?: number, modelType?: number) => {
    return AnnotationUtils.createVisionAnnotationStub(
      id || 1,
      'pump',
      modelType || 1,
      1,
      123,
      124,
      { shape: 'rectangle', vertices: [] }
    );
  };

  describe('Test selectFileAnnotations', () => {
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

  describe('Test selectAnnotationsForAllFiles', () => {
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
      expect(selectAnnotationsForAllFiles(previousState, [10, 20, 30])).toEqual(
        {
          '10': [getDummyAnnotation(1)],
          '20': [getDummyAnnotation(2)],
          '30': [], // prefer to not raise exception in selectors
        }
      );
    });
  });

  describe('Test selectFileAnnotationsByType', () => {
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
});
