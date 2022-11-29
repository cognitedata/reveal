import { UNIT_SEPARATOR } from 'utils/constants';

export const formatNumber = new Intl.NumberFormat().format;

export const isNumber = (value: Number) => !Number.isNaN(value);

export const isNumeric = (value: string) => {
  return /^-?\d+$/.test(value);
};

export const decimalToPercent = (value: number) =>
  Math.round((value + Number.EPSILON) * 100);

export const withThousandSeparator = (
  value: number,
  separator = UNIT_SEPARATOR
) => {
  if (value)
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return '0';
};

// TODO: This is added to handle '1K+' phrase we get due to the aggregate limitations for advanced filters.
export const withThousandSeparatorStringExtended = (
  value: number | string,
  separator = UNIT_SEPARATOR
) => {
  if (typeof value === 'string') {
    return value;
  }

  return withThousandSeparator(value, separator);
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

// TODO: This is added to handle '1K+' phrase we get due to the aggregate limitations for advanced filters.
export const formatBigNumbersWithSuffixStringExtended = (
  value: number | string
) => {
  if (typeof value === 'string') {
    return value;
  }

  return formatBigNumbersWithSuffix(value);
};
