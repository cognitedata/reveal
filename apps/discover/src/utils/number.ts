import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import { ERROR_INVALID_DATA } from 'constants/error';

export const withThousandSeparator = (value: number, separator = ' ') => {
  if (value)
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return '0';
};

export const toFixedNumber = (value: string, fractionDigits = 3) => {
  const number = Number(value);

  return Number.isNaN(number)
    ? ERROR_INVALID_DATA
    : number.toFixed(fractionDigits);
};

export const formatBigNumbersWithSuffix = (value: number) => {
  const MILLION = 1000000;
  const TEN_THOUSAND = 10000;
  const THOUSAND = 1000;

  const isMillions = value > MILLION;
  const isTenThousands = value > TEN_THOUSAND;

  // if value is >1M display suffix with 'M+'
  if (isMillions) {
    const millions = (value / MILLION).toFixed(1);
    // remove any .0
    const cleanMillions =
      millions[millions.length - 1] === '0' ? millions.split('.')[0] : millions;
    return `${cleanMillions}M+`;
  }

  // if value is >10k and <999k display suffix with 'K+'.
  if (isTenThousands) {
    const hundreds = (value / THOUSAND).toFixed(1);
    const cleanHundreds =
      hundreds[hundreds.length - 1] === '0' ? hundreds.split('.')[0] : hundreds;
    return `${cleanHundreds}K+`;
  }

  // if value below <10k, just display the original value.
  return value;
};

export const getHumanReadableFileSize = (bytes?: number | string) => {
  if (isUndefined(bytes)) {
    return 'Unknown';
  }

  const parsedBytes = Number(bytes);

  if (isString(bytes) && !isNumber(parsedBytes)) return bytes;

  // for bad data ingestion
  if (isNaN(bytes) || !bytes || !parsedBytes) {
    return 'Unknown';
  }

  if (parsedBytes < 1024) return `${parsedBytes} Bytes`;
  if (parsedBytes < 1048576) return `${(parsedBytes / 1024).toFixed(2)} KB`;
  if (parsedBytes < 1073741824)
    return `${(parsedBytes / 1048576).toFixed(2)} MB`;
  return `${(parsedBytes / 1073741824).toFixed(2)} GB`;
};
