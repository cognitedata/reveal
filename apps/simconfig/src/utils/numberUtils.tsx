import { format as formatNumber } from 'd3';

const DECIMAL_LIMIT = 5;
const EXPONENT_LIMIT = 3;

const countDecimals = (input: number) => {
  if (Math.floor(input.valueOf()) === input.valueOf()) {
    return 0;
  }

  const str = input.toString();
  if (str.includes('.') && str.includes('-')) {
    return str.split('-')[1] || 0;
  }
  if (str.includes('.')) {
    return str.split('.')[1].length || 0;
  }
  return str.split('-')[1] || 0;
};

const getSciNumber = (input: string) => {
  const matches = input.match(/([^e]+)(e\+?(.*))?/);
  const base = +(matches?.[1] ?? NaN);
  const exponent = +(matches?.[3] ?? '0');

  if (Math.abs(exponent) <= EXPONENT_LIMIT) {
    // Display numbers with small exponents in decimal form
    return {
      base: formatNumber(`.${DECIMAL_LIMIT}~f`)(+(base * 10 ** exponent)),
      exponent: 0,
    };
  }
  return { base, exponent };
};

export const formatSciValue = (input: number) => {
  if (countDecimals(input) >= DECIMAL_LIMIT) {
    return getSciNumber(input.toExponential(DECIMAL_LIMIT));
  }
  return getSciNumber(input.toFixed(DECIMAL_LIMIT));
};

export const getFormattedSciNumber = (input: number | string) => {
  try {
    const { base, exponent } = formatSciValue(+input);

    return (
      <span className="number">
        {base}
        {exponent !== 0 && (
          <span>
            {' '}
            × 10<sup>{exponent}</sup>
          </span>
        )}
      </span>
    );
  } catch (e) {
    return <span className="number">{input}</span>;
  }
};
