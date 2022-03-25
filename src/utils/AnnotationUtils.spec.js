import {
  AnnotationUtils,
  calculateBadgeCountsDifferences,
  getAnnotationCounts,
  getAnnotationsBadgeCounts,
  AnnotationStatus,
} from 'src/utils/AnnotationUtils';

import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { getDummyAnnotation } from 'src/__test-utils/annotations';

describe('annotationCounts', () => {
  it('should return unique annotation texts and number of occurences', () => {
    const annotations = [
      {
        label: 'gauge',
      },
      {
        label: 'pump',
      },
      {
        label: 'pump',
      },
    ];

    expect(getAnnotationCounts(annotations)).toStrictEqual({
      gauge: 1,
      pump: 2,
    });
  });
});

describe('getAnnotationsBadgeCounts', () => {
  it('should return unique annotation texts and number of occurences', () => {
    const annotations = [
      {
        label: 'gauge',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
      {
        label: 'gauge',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
      {
        label: 'PTX123',
        modelType: VisionDetectionModelType.TagDetection,
      },
      {
        label: 'person',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
    ];

    expect(getAnnotationsBadgeCounts(annotations)).toStrictEqual({
      objects: 2,
      assets: 1,
      text: 0,
      gdpr: 1,
      mostFrequentObject: ['gauge', 2],
    });
  });
});

describe('calculateBadgeCountsDifferences', () => {
  it('should return difference between A and B', () => {
    const badgeCountsA = {
      gdpr: 10,
      assets: 10,
      text: 10,
      objects: 10,
    };
    const badgeCountsB = {
      gdpr: 4,
      assets: 4,
      text: 4,
      objects: 4,
    };
    expect(calculateBadgeCountsDifferences(badgeCountsA, badgeCountsB)).toEqual(
      {
        objects: 6,
        assets: 6,
        text: 6,
        gdpr: 6,
        mostFrequentObject: undefined,
      }
    );
  });
  it('should return difference of non-null values between A and B', () => {
    const badgeCountsA = {
      gdpr: 10,
      text: 10,
      objects: 1,
    };
    const badgeCountsB = {
      gdpr: 4,
      assets: 4,
      objects: 10,
    };
    expect(calculateBadgeCountsDifferences(badgeCountsA, badgeCountsB)).toEqual(
      {
        gdpr: 6,
        assets: 0,
        text: 0,
        objects: 0,
        mostFrequentObject: undefined,
      }
    );
  });
});

describe('filterAnnotations', () => {
  const statuses = [
    AnnotationStatus.Verified,
    AnnotationStatus.Rejected,
    AnnotationStatus.Unhandled,
  ];
  const names = ['a', 'a', 'b'];
  const annotations = statuses.map((annotationStatus, index) =>
    getDummyAnnotation(index + 1, 1, {
      status: annotationStatus,
      text: names[index],
    })
  );
  test('undefined filter', () => {
    expect(AnnotationUtils.filterAnnotations(annotations)).toEqual(
      expect.arrayContaining(annotations)
    );
  });
  test('empty filter', () => {
    expect(AnnotationUtils.filterAnnotations(annotations, {})).toEqual(
      expect.arrayContaining(annotations)
    );
  });
  statuses.forEach((annotationStatus, index) => {
    test(`filter ${annotationStatus}`, () => {
      expect(
        AnnotationUtils.filterAnnotations(annotations, { annotationStatus })
      ).toEqual(expect.arrayContaining([annotations[index]]));
    });
  });
  test('filter annotation text', () => {
    expect(
      AnnotationUtils.filterAnnotations(annotations, { annotationText: 'a' })
    ).toEqual(expect.arrayContaining(annotations.slice(0, 2)));
  });
});

describe('filterAnnotationIdsByAnnotationStatus', () => {
  const statuses = [
    AnnotationStatus.Verified,
    AnnotationStatus.Rejected,
    AnnotationStatus.Unhandled,
  ];
  const annotations = statuses.map((annotationStatus, index) =>
    getDummyAnnotation(index + 1, 1, {
      status: annotationStatus,
      text: `${index + 1}`,
    })
  );
  test('get ids by rejected, verified and unhandled statuses', () => {
    expect(
      AnnotationUtils.filterAnnotationsIdsByAnnotationStatus(annotations)
    ).toEqual({
      rejectedAnnotationIds: [2],
      acceptedAnnotationIds: [1],
      unhandledAnnotationIds: [3],
    });
  });
});

describe('filterAnnotationsIdsByConfidence', () => {
  const statuses = [
    AnnotationStatus.Unhandled,
    AnnotationStatus.Unhandled,
    AnnotationStatus.Unhandled,
  ];
  const confidences = [0.9, 0.4, 0.1];
  const annotations = statuses.map((annotationStatus, index) =>
    getDummyAnnotation(index + 1, 1, {
      status: annotationStatus,
      text: `${index + 1}`,
      confidence: confidences[index],
    })
  );
  describe('filter annotations with confidences: [0.9, 0.4, 0.1]', () => {
    test('rejectedThreshold: 0.25, acceptedThreshold: 0.75', () => {
      expect(
        AnnotationUtils.filterAnnotationsIdsByConfidence(
          annotations,
          0.25,
          0.75
        )
      ).toEqual({
        rejectedAnnotationIds: [3],
        acceptedAnnotationIds: [1],
        unhandledAnnotationIds: [2],
      });
    });
    test('rejectedThreshold: 0.00, acceptedThreshold: 0.00', () => {
      expect(
        AnnotationUtils.filterAnnotationsIdsByConfidence(annotations, 0.0, 0.0)
      ).toEqual({
        rejectedAnnotationIds: [],
        acceptedAnnotationIds: [1, 2, 3],
        unhandledAnnotationIds: [],
      });
    });
    test('rejectedThreshold: 0.00, acceptedThreshold: 1.00', () => {
      expect(
        AnnotationUtils.filterAnnotationsIdsByConfidence(annotations, 0.0, 1.0)
      ).toEqual({
        rejectedAnnotationIds: [],
        acceptedAnnotationIds: [],
        unhandledAnnotationIds: [1, 2, 3],
      });
    });
    test('rejectedThreshold: 1.00, acceptedThreshold: 1.00', () => {
      expect(
        AnnotationUtils.filterAnnotationsIdsByConfidence(annotations, 1.0, 1.0)
      ).toEqual({
        rejectedAnnotationIds: [1, 2, 3],
        acceptedAnnotationIds: [],
        unhandledAnnotationIds: [],
      });
    });
    test('rejectedThreshold: 0.50, acceptedThreshold: 0.50', () => {
      expect(
        AnnotationUtils.filterAnnotationsIdsByConfidence(annotations, 0.5, 0.5)
      ).toEqual({
        rejectedAnnotationIds: [2, 3],
        acceptedAnnotationIds: [1],
        unhandledAnnotationIds: [],
      });
    });
  });
  statuses.push(
    // Fallback options when confidences are undefined
    AnnotationStatus.Verified,
    AnnotationStatus.Unhandled,
    AnnotationStatus.Rejected
  );
  confidences.push(undefined, undefined, undefined);
  const annotations2 = statuses.map((annotationStatus, index) =>
    getDummyAnnotation(index + 1, 1, {
      status: annotationStatus,
      text: `${index + 1}`,
      confidence: confidences[index],
    })
  );
  test('Should use status as fallback if confidence is undefined', () => {
    expect(
      AnnotationUtils.filterAnnotationsIdsByConfidence(annotations2, 0.25, 0.75)
    ).toEqual({
      rejectedAnnotationIds: [3, 6],
      acceptedAnnotationIds: [1, 4],
      unhandledAnnotationIds: [2, 5],
    });
  });
});
