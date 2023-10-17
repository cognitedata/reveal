export const formatNumberWithSuffix = (num: number, digits: number): string => {
  const absNum = Math.abs(num);
  const sign = Math.sign(num);

  let formattedNumber: string;
  let suffix = '';

  if (absNum >= 1.0e9) {
    formattedNumber = (sign * (absNum / 1.0e9)).toFixed(digits);
    suffix = 'b';
  } else if (absNum >= 1.0e6) {
    formattedNumber = (sign * (absNum / 1.0e6)).toFixed(digits);
    suffix = 'm';
  } else if (absNum >= 1.0e3) {
    formattedNumber = (sign * (absNum / 1.0e3)).toFixed(digits);
    suffix = 'k';
  } else {
    formattedNumber = num.toFixed(digits);
  }

  // Remove unnecessary trailing zeros and decimal point
  formattedNumber = parseFloat(formattedNumber).toString();

  return formattedNumber + suffix;
};
