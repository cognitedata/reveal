const DECIMAL_LIMIT = 5;
const EXPONENT_LIMIT = 3;

const countDecimals = (input: number) => {
  if (Math.floor(input.valueOf()) === input.valueOf()) return 0;

  const str = input.toString();
  if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
    return str.split('-')[1] || 0;
  }
  if (str.indexOf('.') !== -1) {
    return str.split('.')[1].length || 0;
  }
  return str.split('-')[1] || 0;
};

const getSciNumber = (input: string) => {
  const matches = input.match(/([^e]+)(e\+?(.*))?/);
  const base = +(matches?.[1] || NaN);
  const exponent = +(matches?.[3] || '0');

  if (Math.abs(exponent) <= EXPONENT_LIMIT) {
    // Display numbers with small exponents in decimal form
    return {
      base: +(base * 10 ** exponent).toFixed(DECIMAL_LIMIT),
      exponent: 0,
    };
  }
  return { base, exponent };
};

export const formatBcValue = (input: number) => {
  if (countDecimals(input) >= DECIMAL_LIMIT) {
    return getSciNumber(input.toExponential(DECIMAL_LIMIT));
  }
  return getSciNumber(input.toFixed(DECIMAL_LIMIT));
};
