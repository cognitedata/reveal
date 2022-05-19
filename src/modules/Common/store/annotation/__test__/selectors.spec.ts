/* eslint-disable jest/no-disabled-tests */
import { initialState } from 'src/modules/Common/store/annotation/slice';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  getDummyImageAssetLinkAnnotation,
  getDummyImageClassificationAnnotation,
  getDummyImageExtractedTextAnnotation,
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageObjectDetectionPolygonAnnotation,
  getDummyImageObjectDetectionPolylineAnnotation,
} from 'src/__test-utils/getDummyAnnotations';
import {
  annotatedFilesById,
  annotationsById,
  filesAnnotationCounts,
  makeSelectAnnotationsForFileIds,
  makeSelectFileAnnotations,
  makeSelectFileAnnotationsByType,
  makeSelectTotalAnnotationCountForFileIds,
} from 'src/modules/Common/store/annotation/selectors';
import { CDFAnnotationTypeEnum, Status } from 'src/api/annotation/types';

const annotations = [
  getDummyImageClassificationAnnotation({
    id: 1,
    annotatedResourceId: 10,
    label: 'foo',
    status: Status.Suggested,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    id: 2,
    label: 'person',
    annotatedResourceId: 10,
  }),
  getDummyImageObjectDetectionPolygonAnnotation({
    id: 3,
    annotatedResourceId: 10,
  }),
  getDummyImageExtractedTextAnnotation({
    id: 4,
    annotatedResourceId: 10,
  }),
  getDummyImageAssetLinkAnnotation({
    id: 5,
    annotatedResourceId: 10,
  }),
  getDummyImageAssetLinkAnnotation({
    id: 6,
    annotatedResourceId: 10,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    id: 7,
    annotatedResourceId: 20,
    label: 'bar',
    status: Status.Rejected,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    id: 8,
    annotatedResourceId: 20,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    id: 9,
    annotatedResourceId: 20,
  }),
  getDummyImageExtractedTextAnnotation({
    id: 10,
    annotatedResourceId: 30,
  }),
  getDummyImageObjectDetectionPolylineAnnotation({
    id: 11,
    annotatedResourceId: 30,
  }),
];

const mockState: AnnotationState = {
  ...initialState,
  files: {
    byId: {
      '10': [1, 2, 3, 4, 5, 6],
      '20': [7, 8, 9],
      '30': [10, 11],
      '40': [],
    },
  },
  annotations: {
    byId: {
      '1': annotations[0],
      '2': annotations[1],
      '3': annotations[2],
      '4': annotations[3],
      '5': annotations[4],
      '6': annotations[5],
      '7': annotations[6],
      '8': annotations[7],
      '9': annotations[8],
      '10': annotations[9],
      '11': annotations[10],
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
    test('should return all annotations for provided file ids', () => {
      expect(selectAnnotationsForFileIds(mockState, [10, 20, 40])).toEqual({
        '10': [
          annotations[0],
          annotations[1],
          annotations[2],
          annotations[3],
          annotations[4],
          annotations[5],
        ],
        '20': [annotations[6], annotations[7], annotations[8]],
        '40': [], // prefer to not raise exception in selectors
      });
    });
    test('should return the annotations filtered by text for provided file ids', () => {
      expect(
        selectAnnotationsForFileIds(mockState, [10, 20, 30], {
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
        selectAnnotationsForFileIds(mockState, [10, 20, 30], {
          annotationState: Status.Rejected,
        })
      ).toEqual({
        '10': [],
        '20': [annotations[6]],
        '30': [],
      });
    });
  });

  describe('Test makeSelectFileAnnotationsByType', () => {
    const selectFileAnnotationsByType = makeSelectFileAnnotationsByType();

    describe('should select annotations with specified type', () => {
      // select annotations for file id 10 with model type imageClassification
      test('get ImagesClassifications for file 10', () => {
        expect(
          selectFileAnnotationsByType(mockState, 10, [
            CDFAnnotationTypeEnum.ImagesClassification,
          ])
        ).toEqual([annotations[0]]);
      });

      test('get ImagesObjectDetections for file 20', () => {
        // select annotations for file id 20 with model type imageObjectDetectionBoundingBox
        expect(
          selectFileAnnotationsByType(mockState, 20, [
            CDFAnnotationTypeEnum.ImagesObjectDetection,
          ])
        ).toEqual([annotations[6], annotations[7], annotations[8]]);
      });
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
    describe('Test makeSelectTotalAnnotationCountForFileIds', () => {
      test('should return annotation counts for all annotations of provided file ids', () => {
        const selectTotalAnnotationCounts =
          makeSelectTotalAnnotationCountForFileIds();

        expect(selectTotalAnnotationCounts(mockState, [10])).toEqual({
          objects: 1,
          assets: 2,
          text: 1,
          gdpr: 1,
          mostFrequentObject: ['pump', 1],
        });

        expect(selectTotalAnnotationCounts(mockState, [20])).toEqual({
          objects: 3,
          assets: 0,
          text: 0,
          gdpr: 0,
          mostFrequentObject: ['pump', 2],
        });
      });
    });
  });
});
