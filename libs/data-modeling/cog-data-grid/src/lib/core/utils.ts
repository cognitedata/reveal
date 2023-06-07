import isInteger from 'lodash/isInteger';
import isNumber from 'lodash/isNumber';

export type DecimalValueFormatterProps = {
  value: number;
  maximumFractionDigits?: number;
  isFloat?: boolean;
};

export const decimalValueFormatter = ({
  value,
  maximumFractionDigits,
  isFloat,
}: DecimalValueFormatterProps) => {
  if (!isNumber(value)) {
    return '';
  }

  if (isFloat && value === 0) {
    return '0.0';
  }

  if (isFloat && isInteger(maximumFractionDigits)) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits,
    });
  }

  return `${value}`;
};
