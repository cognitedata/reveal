import max from 'lodash/max';

export const calculateCumulativeTotalDrillingDays = <
  T extends { totalDrillingDays?: number }
>(
  wellbores: T[]
) => {
  return max(wellbores.map(({ totalDrillingDays }) => totalDrillingDays));
};
