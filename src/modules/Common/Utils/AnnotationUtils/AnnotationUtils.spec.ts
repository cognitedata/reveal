import {
  getDummyImageAssetLinkAnnotation,
  getDummyImageClassificationAnnotation,
  getDummyImageExtractedTextAnnotation,
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageObjectDetectionPolygonAnnotation,
} from 'src/modules/Common/store/annotation/__test__/getDummyAnnotations';
import {
  filterAnnotations,
  getAnnotationLabelText,
  getAnnotationsBadgeCounts,
} from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotationsBadgeCounts,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/index';
import { Status } from 'src/api/annotation/types';

const ANN_WITH_PUMP_TEXT_COUNT = 6;
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
  describe('Test getAnnotationLabelText', () => {
    test('get label for ImageClassification', () => {
      const label = 'pump';
      const annotation = getDummyImageClassificationAnnotation({
        label,
      });

      expect(getAnnotationLabelText(annotation)).toEqual(label);
    });

    test('get label for ImageObjectDetectionBoundingBox', () => {
      const label = 'pump';
      const annotation = getDummyImageObjectDetectionBoundingBoxAnnotation({
        label,
      });

      expect(getAnnotationLabelText(annotation)).toEqual(label);
    });

    test('get label for ImageObjectDetectionPolygon', () => {
      const label = 'pump';
      const annotation = getDummyImageObjectDetectionPolygonAnnotation({
        label,
      });

      expect(getAnnotationLabelText(annotation)).toEqual(label);
    });

    test('get label for ImageExtractedText', () => {
      const extractedText = 'pump';
      const annotation = getDummyImageExtractedTextAnnotation({
        extractedText,
      });

      expect(getAnnotationLabelText(annotation)).toEqual(extractedText);
    });

    test('get label for ImageAssetLink', () => {
      const text = 'pump';
      const annotation = getDummyImageAssetLinkAnnotation({
        text,
      });

      expect(getAnnotationLabelText(annotation)).toEqual(text);
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

    describe('test with annotationText filter', () => {
      test('filter pump as label, extractedText and text', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationText: 'pump' },
          }).length
        ).toBe(ANN_WITH_PUMP_TEXT_COUNT);
      });

      test('filter pump3 as extractedText', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationText: 'pump3' },
          }).length
        ).toBe(1);
      });

      test('filter pumpLink as text', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: { annotationText: 'pumpLink' },
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

    describe('test with annotationText & annotationState filter', () => {
      test('filter Suggested annotations', () => {
        expect(
          filterAnnotations({
            annotations: dummyAnnotations,
            filter: {
              annotationText: 'pump',
              annotationState: Status.Suggested,
            },
          }).length
        ).toBe(ANN_WITH_SUGGESTED_PUMP_COUNT);
      });
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
});
