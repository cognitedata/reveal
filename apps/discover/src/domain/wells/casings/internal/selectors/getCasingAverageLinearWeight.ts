import isEmpty from 'lodash/isEmpty';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';
import { LinearWeight } from 'utils/units/constants';

import { CasingComponentInternal } from '../types';

type ComponentType = Pick<CasingComponentInternal, 'linearWeight'>;

export const getCasingAverageLinearWeight = <T extends ComponentType>(
  components: T[],
  toFixed = Fixed.TwoDecimals
): LinearWeight | undefined => {
  const linearWeights = components.reduce((acc, { linearWeight }) => {
    if (linearWeight) {
      return [...acc, linearWeight];
    }
    return acc;
  }, [] as LinearWeight[]);

  if (isEmpty(linearWeights)) {
    return undefined;
  }

  const total = linearWeights.reduce((acc, { value }) => {
    return acc + value;
  }, 0);

  const average = total / linearWeights.length;

  return {
    value: toFixedNumberFromNumber(average, toFixed),
    unit: linearWeights[0].unit,
  };
};
