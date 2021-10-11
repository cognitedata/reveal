const driveRegex = new RegExp('^[A-Za-z]-drive');

export const convertPath = (path: string) => {
  if (!path || path.length < 1) {
    return '';
  }
  const pathForwardSlashConvertedToBackSlash = path.replace(/\//g, '\\');

  const matchesDriveRegex = path.match(driveRegex);
  const result = matchesDriveRegex
    ? pathForwardSlashConvertedToBackSlash.replace('-drive', ':')
    : `\\\\${pathForwardSlashConvertedToBackSlash.replace(/^\\+/, '')}`;

  return result;
};
