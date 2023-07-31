import { endOf, isValidDate, startOf } from 'utils/date';

import { SpudDateLimits } from '@cognite/sdk-wells';

export const processSpudDateLimits = (spudDateLimits: SpudDateLimits) => {
  const minDate = new Date(String(spudDateLimits.min));
  const maxDate = new Date(String(spudDateLimits.max));

  return [
    isValidDate(minDate) ? startOf(minDate, 'day') : undefined,
    isValidDate(maxDate) ? endOf(maxDate, 'day') : undefined,
  ];
};
