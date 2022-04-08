import {
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from 'src/modules/Common/types';
import {
  hasJobsFailedForFile,
  isProcessingFile,
} from 'src/modules/Process/store/utils';
import { JobStatus } from 'src/api/vision/detectionModels/types';
import { ProcessSummary } from 'src/modules/Process/types';
import { calculateSummaryStats } from 'src/modules/Process/utils';

describe('Test file process utils', () => {
  describe('Test util isProcessingFile', () => {
    const mockAnnotationBadgeProps: AnnotationsBadgeStatuses = {
      tag: { status: 'Completed', statusTime: 12323232223, error: '' },
      gdpr: {
        status: 'Failed',
        statusTime: 12323232223,
        error: 'Error Occurred!',
      },
      text: { status: 'Queued', statusTime: 12323232223, error: undefined },
      objects: { status: 'Running', statusTime: 12323232223, error: undefined },
    };
    test('file processing true when some jobs are Queued', () => {
      // no Running jobs
      const badgeProps: AnnotationsBadgeStatuses = {
        ...mockAnnotationBadgeProps,
        objects: {
          status: 'Queued',
          statusTime: 12323232223,
          error: undefined,
        },
      };

      expect(isProcessingFile(badgeProps)).toBe(true);
    });

    test('file processing true when some jobs are Running', () => {
      // no Queued jobs
      const badgeProps: AnnotationsBadgeStatuses = {
        ...mockAnnotationBadgeProps,
        text: { status: 'Running', statusTime: 12323232223, error: undefined },
      };

      expect(isProcessingFile(badgeProps)).toBe(true);
    });

    test('file processing false when no job is Queued or Running', () => {
      // no Running or Queued jobs
      const badgeProps: AnnotationsBadgeStatuses = {
        ...mockAnnotationBadgeProps,
        text: { status: 'Completed', statusTime: 12323232223, error: '' },
        objects: { status: 'Completed', statusTime: 12323232223, error: '' },
      };

      expect(isProcessingFile(badgeProps)).toBe(false);
    });
  });

  describe('Test util hasJobsFailedForFile', () => {
    const mockAnnotationBadgeProps: AnnotationsBadgeStatuses = {
      tag: { status: 'Completed', statusTime: 12323232223, error: '' },
      gdpr: {
        status: 'Failed',
        statusTime: 12323232223,
        error: 'Error Occurred!',
      },
      text: { status: 'Queued', statusTime: 12323232223, error: undefined },
      objects: { status: 'Running', statusTime: 12323232223, error: undefined },
    };

    test('Return return true if one of the jobs has failed without providing error', () => {
      const badgeProps = {
        ...mockAnnotationBadgeProps,
        gdpr: {
          ...mockAnnotationBadgeProps.gdpr,
          error: '',
        } as AnnotationStatuses,
      };

      expect(hasJobsFailedForFile(badgeProps)).toEqual(true);
    });

    test('Return return true if one of the jobs is providing an error', () => {
      const badgeProps = {
        ...mockAnnotationBadgeProps,
        gdpr: {} as AnnotationStatuses,
        objects: {
          ...mockAnnotationBadgeProps.objects,
          error: 'Error occurred!!',
        } as AnnotationStatuses,
      };

      expect(hasJobsFailedForFile(badgeProps)).toEqual(true);
    });

    test('Return false if all the jobs is without error', () => {
      const badgeProps = {
        ...mockAnnotationBadgeProps,
        gdpr: {
          ...mockAnnotationBadgeProps.gdpr,
          status: 'Completed' as JobStatus,
          error: '',
        } as AnnotationStatuses,
      };

      expect(hasJobsFailedForFile(badgeProps)).toEqual(false);
    });
  });
});

describe('Test calculateSummaryStats', () => {
  it('should return counts correctly when available', () => {
    const dummyStateSummary: ProcessSummary = {
      totalProcessed: 3,
      totalGeolocated: 1,
      totalUserReviewedFiles: 1,
      totalModelDetected: 3,
      totalUnresolvedGDPR: 1,
      fileCountsByAnnotationType: {
        text: 1,
        assets: 1,
        objects: 1,
      },
      filePercentagesByAnnotationType: {
        text: 33,
        assets: 33,
        objects: 33,
      },
    };

    const mockCalculatedStats = {
      totalFiles: {
        text: 'total files processed',
        value: dummyStateSummary.totalProcessed,
      },
      filesGeolocated: {
        text: 'geolocated files',
        value: dummyStateSummary.totalGeolocated,
      },
      filesUserReviewed: {
        text: 'user-reviewed files',
        value: dummyStateSummary.totalUserReviewedFiles,
      },
      filesWithModelDetections: {
        text: 'files with tags, texts or objects ',
        value: dummyStateSummary.totalModelDetected,
        filesWithText: {
          count: dummyStateSummary.fileCountsByAnnotationType.text,
          percentage: dummyStateSummary.filePercentagesByAnnotationType.text,
        },
        filesWithAssets: {
          count: dummyStateSummary.fileCountsByAnnotationType.assets,
          percentage: dummyStateSummary.filePercentagesByAnnotationType.assets,
        },
        filesWithObjects: {
          count: dummyStateSummary.fileCountsByAnnotationType.objects,
          percentage: dummyStateSummary.filePercentagesByAnnotationType.objects,
        },
      },
      filesWithUnresolvedPersonCases: {
        text: 'unresolved person detections',
        value: dummyStateSummary.totalUnresolvedGDPR,
      },
    };
    expect(calculateSummaryStats(dummyStateSummary)).toEqual(
      mockCalculatedStats
    );
  });

  it('should return counts correctly when all counts are 0', () => {
    const dummyStateSummary: ProcessSummary = {
      totalProcessed: 0,
      totalGeolocated: 0,
      totalUserReviewedFiles: 0,
      totalModelDetected: 0,
      totalUnresolvedGDPR: 0,
      fileCountsByAnnotationType: {
        text: 0,
        assets: 0,
        objects: 0,
      },
      filePercentagesByAnnotationType: {
        text: 0,
        assets: 0,
        objects: 0,
      },
    };

    const mockCalculatedStats = {
      totalFiles: {
        text: 'total files processed',
        value: 0,
      },
      filesGeolocated: {
        text: 'geolocated files',
        value: 0,
      },
      filesUserReviewed: {
        text: 'user-reviewed files',
        value: 0,
      },
      filesWithModelDetections: {
        text: 'files with tags, texts or objects ',
        value: 0,
        filesWithText: {
          count: 0,
          percentage: 0,
        },
        filesWithAssets: {
          count: 0,
          percentage: 0,
        },
        filesWithObjects: {
          count: 0,
          percentage: 0,
        },
      },
      filesWithUnresolvedPersonCases: {
        text: 'unresolved person detections',
        value: 0,
      },
    };
    expect(calculateSummaryStats(dummyStateSummary)).toEqual(
      mockCalculatedStats
    );
  });
});
