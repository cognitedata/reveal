/* eslint-disable jest/no-disabled-tests */
import { initialState } from 'src/modules/Common/store/annotation/slice';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  getDummyImageClassificationAnnotation,
  getDummyImageObjectDetectionBoundingBoxAnnotation,
} from 'src/modules/Common/store/annotation/utils/getDummyAnnotations';
import {
  annotatedFilesById,
  annotationsById,
  makeSelectAnnotationsForFileIds,
  makeSelectFileAnnotations,
} from 'src/modules/Common/store/annotation/selectors';
import { Status } from 'src/api/annotation/types';

const mockState: AnnotationState = {
  ...initialState,
  files: {
    byId: {
      '10': [1, 2],
      '20': [3, 4, 5],
      '30': [6],
      '40': [],
    },
  },
  annotations: {
    byId: {
      '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 10,
      }),
      '2': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 10,
      }),
      '3': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 3,
        annotatedResourceId: 20,
      }),
      '4': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 4,
        annotatedResourceId: 20,
      }),
      '5': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 5,
        annotatedResourceId: 20,
      }),
      '6': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 6,
        annotatedResourceId: 30,
      }),
    },
  },
};

describe('Test annotation selectors', () => {
  describe('Test annotationsById selector', () => {
    test('should return all the annotations', () => {
      expect(annotationsById(mockState)).toEqual(mockState.annotations.byId);
    });
  });

  describe('Test annotatedFilesById selector', () => {
    test('should return all the annotated files', () => {
      expect(annotatedFilesById(mockState)).toEqual(mockState.files.byId);
    });
  });

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
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 1,
              annotatedResourceId: 10,
            }),
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 1,
              annotatedResourceId: 20,
            }),
          },
        },
      };
      expect(selectFileAnnotations(previousState, 10)).toEqual([
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 1,
          annotatedResourceId: 10,
        }),
      ]);
    });
  });

  describe('Test makeSelectAnnotationsForFileIds', () => {
    const selectAnnotationsForFileIds = makeSelectAnnotationsForFileIds();
    const annotations = [
      getDummyImageClassificationAnnotation({
        id: 1,
        annotatedResourceId: 10,
        label: 'foo',
        status: Status.Suggested,
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 20,
        label: 'bar',
        status: Status.Rejected,
      }),
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
          annotationText: 'foo',
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
          annotationState: Status.Rejected,
        })
      ).toEqual({
        '10': [],
        '20': [annotations[1]],
        '30': [],
      });
    });
  });
});
