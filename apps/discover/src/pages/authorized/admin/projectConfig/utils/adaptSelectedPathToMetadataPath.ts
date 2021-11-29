export const adaptSelectedPathToMetadataPath = (selectedPath = '') =>
  selectedPath.replace(/\.\d+/g, '').replace(/\./g, '.children.');
