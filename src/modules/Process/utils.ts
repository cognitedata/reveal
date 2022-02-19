import { ProcessSummary } from 'src/modules/Process/types';

export const calculateSummaryStats = (summary: ProcessSummary) => {
  const stats = {
    totalFiles: {
      text: 'total files processed',
      value: summary.totalProcessed,
    },
    filesGeolocated: {
      text: 'geolocated files',
      value: summary.totalGeolocated,
    },
    filesUserReviewed: {
      text: 'user-reviewed files',
      value: summary.totalUserReviewedFiles,
    },
    filesWithModelDetections: {
      text: 'files with tags, texts or objects ',
      value: summary.totalModelDetected,
      filesWithText: {
        count: summary.fileCountsByAnnotationType.text,
        percentage: summary.filePercentagesByAnnotationType.text,
      },
      filesWithAssets: {
        count: summary.fileCountsByAnnotationType.assets,
        percentage: summary.filePercentagesByAnnotationType.assets,
      },
      filesWithObjects: {
        count: summary.fileCountsByAnnotationType.objects,
        percentage: summary.filePercentagesByAnnotationType.objects,
      },
    },
    filesWithUnresolvedPersonCases: {
      text: 'unresolved person detections',
      value: summary.totalUnresolvedGDPR,
    },
  };

  return stats;
};
