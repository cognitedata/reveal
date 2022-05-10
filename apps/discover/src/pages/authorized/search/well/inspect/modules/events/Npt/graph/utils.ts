import get from 'lodash/get';
import { getTimeDuration } from 'utils/date';
import { HOURS_IN_A_DAY } from 'utils/date/constants';
import { sortByCaseInsensitive } from 'utils/sort';

import { LegendCheckboxState } from 'components/Charts/common/Legend';
import { DataObject } from 'components/Charts/types';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors } from '../constants';

export const formatTooltip = (event: NPTEvent) =>
  `${get(event, accessors.NPT_CODE)} - ${getTimeDuration(
    get(event, accessors.DURATION),
    'days'
  )}`;

export const getNptCodeCheckboxOptions = <T extends DataObject<T>>(
  data: T[],
  accessor: string
) => {
  const dataOption = [
    ...new Set(data.map((dataElement: T) => dataElement[accessor])),
  ].sort(sortByCaseInsensitive);

  const checkboxState = dataOption.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as LegendCheckboxState
  );

  return { dataOption, checkboxState };
};

export const adaptEventsToDaysDuration = (events: NPTEvent[]): NPTEvent[] =>
  events.map((event) => ({
    ...event,
    [accessors.DURATION]: get(event, accessors.DURATION, 0) / HOURS_IN_A_DAY,
  }));
