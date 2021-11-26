import { INTERVAL_UNIT } from 'components/forms/ConfigurationForm/constants';

export const isIntervalUnit = (
  value: string
): value is keyof typeof INTERVAL_UNIT => value in INTERVAL_UNIT;

export const getIntervalValueInMinutes = (
  value: number,
  intervalUnitValue: string
) => {
  const multiplicative = {
    m: 1,
    h: 60,
    d: 60 * 24,
    w: 60 * 24 * 7,
  };
  return (
    value * multiplicative[intervalUnitValue as keyof typeof multiplicative]
  );
};

export const getIntervalUnitValue = (value: string) => {
  const intervalUnit = value.slice(-1);
  if (!isIntervalUnit(intervalUnit)) {
    return 'd';
  }
  return intervalUnit;
};
