export const ROOT_CONTAINER_ID = 'root-container-id';

// Assuming these values were large enough to get a usable resolution for the download file.
// Increasing this has a performance tradeoff.
export const MAX_CONTAINER_WIDTH = 3000;
export const MAX_CONTAINER_HEIGHT = 3000;

export const styleForSelected = {
  stroke: '#4C68F6',
  strokeWidth: 2,
  fill: '#D46AE222',
};

export const PREVIEWABLE_IMAGE_TYPES = [
  'png',
  'jpeg',
  'jpg',
  'svg',
  'tiff',
  'tif',
];
export const PREVIEWABLE_DOCUMENT_TYPES = ['pdf'];
export const PREVIEWABLE_FILE_TYPES = [
  ...PREVIEWABLE_IMAGE_TYPES,
  ...PREVIEWABLE_DOCUMENT_TYPES,
];

export const SEARCHABLE_DOCUMENT_TYPES = ['pdf'];

// The retrieved URL becomes invalid in 30 seconds so refetch will trigger after every 25 seconds
export const FILE_URL_REFETCH_INTERVAL = 25000;
