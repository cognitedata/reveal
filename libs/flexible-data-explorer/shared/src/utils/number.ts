import isLodashNumber from 'lodash/isNumber';

/**
 * Checkes for both value and type.
 * @example isNumber(100) -> true
 * @example isNumber('100') -> false
 */
export const isNumber = (value: unknown): value is number => {
  if (Number.isNaN(value)) {
    return false;
  }
  return isLodashNumber(value);
};

/**
 * Checkes only for the value.
 * @example isNumber('100') -> true
 * @example isNumber('100abc') -> false
 */
export const isNumeric = (value: string) => {
  return /^-?\d+(\.\d+)?$/.test(value);
};

export const formatBigNumbersWithSuffix = (value?: number) => {
  const MILLION = 1000000;
  const TEN_THOUSAND = 10000;
  const THOUSAND = 1000;

  if (value === undefined) {
    return undefined;
  }

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
  return String(value);
};

export const formatNumber = (value?: number) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return new Intl.NumberFormat('en-US').format(value);
};
