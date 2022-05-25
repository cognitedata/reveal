import {
  getDummyImageAssetLinkAnnotation,
  getDummyImageClassificationAnnotation,
  getDummyImageExtractedTextAnnotation,
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageObjectDetectionPolygonAnnotation,
  getDummyImageObjectDetectionPolylineAnnotation,
} from 'src/__test-utils/getDummyAnnotations';
import {
  filterAnnotations,
  filterAnnotationIdsByAnnotationStatus,
  filterAnnotationIdsByConfidence,
  getAnnotationLabelOrText,
  getAnnotationsBadgeCounts,
  getKeypointId,
} from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotationsBadgeCounts,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { Status } from 'src/api/annotation/types';

const ANN_WITH_PUMP_LABEL_OR_TEXT_COUNT = 6;
const ANN_WITH_SUGGESTED_PUMP_COUNT = 5;
const SUGGESTED_ANN_COUNT = 5;
const REJECTED_ANN_COUNT = 2;
const APPROVED_ANN_COUNT = 3;

const dummyAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [
  getDummyImageClassificationAnnotation({
    label: 'pump',
    status: Status.Suggested,
  }),
  getDummyImageClassificationAnnotation({
    label: 'pump',
    status: Status.Approved,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    label: 'pump',
    status: Status.Suggested,
  }),
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    label: 'person',
    status: Status.Rejected,
  }),
  getDummyImageObjectDetectionPolygonAnnotation({
    label: 'pump',
    status: Status.Suggested,
  }),
  getDummyImageObjectDetectionPolygonAnnotation({
    label: 'pump3',
    status: Status.Approved,
  }),
  getDummyImageExtractedTextAnnotation({
    extractedText: 'pump',
    status: Status.Suggested,
  }),
  getDummyImageExtractedTextAnnotation({
    extractedText: 'pumpText',
    status: Status.Approved,
  }),
  getDummyImageAssetLinkAnnotation({
    text: 'pump',
    status: Status.Suggested,
  }),
  getDummyImageAssetLinkAnnotation({
    text: 'pumpLink',
    status: Status.Rejected,
  }),
];

describe('Test AnnotationUtils', () => {
  describe('Test getAnnotationLabelOrText', () => {
    test('get label for ImageClassification', () => {
      const label = 'pump';
      const annotation = getDummyImageClassificationAnnotation({
        label,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(label);
    });

    test('get label for ImageObjectDetectionBoundingBox', () => {
      const label = 'pump';
      const annotation = getDummyImageObjectDetectionBoundingBoxAnnotation({
        label,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(label);
    });

    test('get label for ImageObjectDetectionPolygon', () => {
      const label = 'pump';
      const annotation = getDummyImageObjectDetectionPolygonAnnotation({
        label,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(label);
    });

    test('get label for ImageObjectDetectionPolyline', () => {
      const label = 'bar';
      const annotation = getDummyImageObjectDetectionPolylineAnnotation({
        label,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(label);
    });

    test('get label for ImageExtractedText', () => {
      const extractedText = 'pump';
      const annotation = getDummyImageExtractedTextAnnotation({
        extractedText,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(extractedText);
    });

    test('get label for ImageAssetLink', () => {
      const text = 'pump';
      const annotation = getDummyImageAssetLinkAnnotation({
        text,
      });

      expect(getAnnotationLabelOrText(annotation)).toEqual(text);
    });
  });

  describe('Test filterAnnotations', () => {
    test('when filter undefined', () => {
      expect(filterAnnotations({ annotations: dummyAnnotations }).length).toBe(
        dummyAnnotations.length
      );
    });

    test('when no annotations', () => {
      expect(filterAnnotations({ annotations: [] }).length).toBe(0);
    });

    describe('test with annotationLabelOrText filter', () => {
      test('filter pump as label, extractedText and text', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationLabelOrText: 'pump' },
          }).length
        ).toBe(ANN_WITH_PUMP_LABEL_OR_TEXT_COUNT);
      });

      test('filter pump3 as extractedText', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationLabelOrText: 'pump3' },
          }).length
        ).toBe(1);
      });

      test('filter pumpLink as text', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationLabelOrText: 'pumpLink' },
          }).length
        ).toBe(1);
      });
    });

    describe('test with annotationState filter', () => {
      test('filter Suggested annotations', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationState: Status.Suggested },
          }).length
        ).toBe(SUGGESTED_ANN_COUNT);
      });

      test('filter Rejected annotations', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationState: Status.Rejected },
          }).length
        ).toBe(REJECTED_ANN_COUNT);
      });

      test('filter Approved annotations', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationState: Status.Approved },
          }).length
        ).toBe(APPROVED_ANN_COUNT);
      });
    });

    describe('test with annotationLabelOrText & annotationState filter', () => {
      test('filter Suggested annotations', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: {
              annotationLabelOrText: 'pump',
              annotationState: Status.Suggested,
            },
          }).length
        ).toBe(ANN_WITH_SUGGESTED_PUMP_COUNT);
      });
    });
  });

  describe('filterAnnotationIdsByAnnotationStatus', () => {
    const statuses = [Status.Approved, Status.Rejected, Status.Suggested];
    const annotations = statuses.map((annotationStatus, index) =>
      getDummyImageExtractedTextAnnotation({
        id: index + 1,
        status: annotationStatus,
        extractedText: `${index + 1}`,
      })
    );
    test('get ids by rejected, verified and unhandled statuses', () => {
      expect(filterAnnotationIdsByAnnotationStatus(annotations)).toEqual({
        rejectedAnnotationIds: [2],
        acceptedAnnotationIds: [1],
        unhandledAnnotationIds: [3],
      });
    });
  });

  describe('filterAnnotationIdsByConfidence', () => {
    const statuses = [Status.Suggested, Status.Suggested, Status.Suggested];
    const confidences = [0.9, 0.4, 0.1];
    const annotations = statuses.map((annotationStatus, index) =>
      getDummyImageExtractedTextAnnotation({
        id: index + 1,
        status: annotationStatus,
        extractedText: `${index + 1}`,
        confidence: confidences[index],
      })
    );
    describe('filter annotations with confidences: [0.9, 0.4, 0.1]', () => {
      test('rejectedThreshold: 0.25, acceptedThreshold: 0.75', () => {
        expect(
          filterAnnotationIdsByConfidence(annotations, 0.25, 0.75)
        ).toEqual({
          rejectedAnnotationIds: [3],
          acceptedAnnotationIds: [1],
          unhandledAnnotationIds: [2],
        });
      });
      test('rejectedThreshold: 0.00, acceptedThreshold: 0.00', () => {
        expect(filterAnnotationIdsByConfidence(annotations, 0.0, 0.0)).toEqual({
          rejectedAnnotationIds: [],
          acceptedAnnotationIds: [1, 2, 3],
          unhandledAnnotationIds: [],
        });
      });
      test('rejectedThreshold: 0.00, acceptedThreshold: 1.00', () => {
        expect(filterAnnotationIdsByConfidence(annotations, 0.0, 1.0)).toEqual({
          rejectedAnnotationIds: [],
          acceptedAnnotationIds: [],
          unhandledAnnotationIds: [1, 2, 3],
        });
      });
      test('rejectedThreshold: 1.00, acceptedThreshold: 1.00', () => {
        expect(filterAnnotationIdsByConfidence(annotations, 1.0, 1.0)).toEqual({
          rejectedAnnotationIds: [1, 2, 3],
          acceptedAnnotationIds: [],
          unhandledAnnotationIds: [],
        });
      });
      test('rejectedThreshold: 0.50, acceptedThreshold: 0.50', () => {
        expect(filterAnnotationIdsByConfidence(annotations, 0.5, 0.5)).toEqual({
          rejectedAnnotationIds: [2, 3],
          acceptedAnnotationIds: [1],
          unhandledAnnotationIds: [],
        });
      });
    });
    statuses.push(
      // Fallback options when confidences are undefined
      Status.Approved,
      Status.Suggested,
      Status.Rejected
    );
    confidences.push(NaN, NaN, NaN);
    const annotations2 = statuses.map((annotationStatus, index) =>
      getDummyImageExtractedTextAnnotation({
        id: index + 1,
        status: annotationStatus,
        extractedText: `${index + 1}`,
        confidence: confidences[index],
      })
    );
    test('Should use status as fallback if confidence is undefined', () => {
      expect(filterAnnotationIdsByConfidence(annotations2, 0.25, 0.75)).toEqual(
        {
          rejectedAnnotationIds: [3, 6],
          acceptedAnnotationIds: [1, 4],
          unhandledAnnotationIds: [2, 5],
        }
      );
    });
  });

  describe('Test getAnnotationsBadgeCounts', () => {
    const annotationsBadgeCounts: AnnotationsBadgeCounts =
      getAnnotationsBadgeCounts(dummyAnnotations);
    test('text badge count', () => {
      expect(annotationsBadgeCounts.text).toBe(2);
    });
    test('assets badge count', () => {
      expect(annotationsBadgeCounts.assets).toBe(2);
    });
    test('objects badge count', () => {
      expect(annotationsBadgeCounts.objects).toBe(3);
    });
    test('gdpr badge count', () => {
      expect(annotationsBadgeCounts.gdpr).toBe(1);
    });
    test('mostFrequentObject', () => {
      expect(annotationsBadgeCounts.mostFrequentObject).toStrictEqual([
        'pump',
        2,
      ]);
    });
  });
  describe('Test getKeypointId', () => {
    const exception = new Error(
      'Cannot generate keypointId. Parent annotation id or keypoint label not provided'
    );
    test('on empty parent annotation id should throw exception', () => {
      function testGetKeypointId() {
        getKeypointId('', 'test');
      }
      expect(testGetKeypointId).toThrowError(exception);
    });
    test('on empty keypoint label should throw exception', () => {
      function testGetKeypointId() {
        getKeypointId('test', '');
      }
      expect(testGetKeypointId).toThrowError(exception);
    });
    test('when parent annotation id and keypoint label are both empty should throw exception', () => {
      function testGetKeypointId() {
        getKeypointId('', '');
      }
      expect(testGetKeypointId).toThrowError(exception);
    });
    test('should return id when parent anntoation id and keypoint label is provided', () => {
      expect(
        getKeypointId('test string annotation id', 'test keypoint')
      ).toEqual('test string annotation id-test keypoint');
      expect(getKeypointId(12, 'test keypoint')).toEqual('12-test keypoint');
    });
  });
});
