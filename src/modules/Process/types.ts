export type FileAnnotationStats = {
  text: number;
  assets: number;
  objects: number;
};
export type ProcessSummary = {
  totalProcessed: number;
  totalWithExif: number;
  totalUserReviewedFiles: number;
  totalModelDetected: number;
  totalUnresolvedGDPR: number;
  fileCountsByAnnotationType: FileAnnotationStats;
  filePercentagesByAnnotationType: FileAnnotationStats;
};
