import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

export const getHumanReadableFileSize = (bytes?: number | string) => {
  if (isUndefined(bytes)) {
    return 'Unknown';
  }

  const parsedBytes = Number(bytes);

  if (isString(bytes) && !isNumber(parsedBytes)) {
    return bytes;
  }

  // for bad data ingestion
  if (isNaN(bytes) || !bytes || !parsedBytes) {
    return 'Unknown';
  }

  if (parsedBytes < 1024) {
    return `${parsedBytes} Bytes`;
  }
  if (parsedBytes < 1048576) {
    return `${(parsedBytes / 1024).toFixed(2)} KB`;
  }
  if (parsedBytes < 1073741824) {
    return `${(parsedBytes / 1048576).toFixed(2)} MB`;
  }
  return `${(parsedBytes / 1073741824).toFixed(2)} GB`;
};
