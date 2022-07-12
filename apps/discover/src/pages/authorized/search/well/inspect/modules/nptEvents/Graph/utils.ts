import { NptAggregateView } from 'domain/wells/npt/internal/types';

import get from 'lodash/get';
import { ColorMap } from 'utils/colorize';
import { getTimeDuration } from 'utils/date';
import { HOURS_IN_A_DAY } from 'utils/date/constants';
import { sortByCaseInsensitive } from 'utils/sort';

import { LegendCheckboxState } from 'components/Charts/common/Legend';
import { DataObject } from 'components/Charts/types';

import { accessors } from '../constants';

export const formatTooltip = (event: NptAggregateView) =>
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

export const adaptEventsToDaysDuration = (events: NptAggregateView[]) =>
  events.map((event) => ({
    ...event,
    [accessors.DURATION]: get(event, accessors.DURATION, 0) / HOURS_IN_A_DAY,
  }));

export const getNptCodesColorMap = (events: NptAggregateView[]): ColorMap =>
  events.reduce((colorMap, event) => {
    const { nptCode, nptCodeColor } = event;
    if (!nptCode) {
      return { ...colorMap };
    }
    return {
      ...colorMap,
      [nptCode]: nptCodeColor,
    };
  }, {});
