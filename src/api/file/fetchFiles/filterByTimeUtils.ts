/* eslint-disable @typescript-eslint/no-unused-vars */
import { DateRange, FileInfo } from '@cognite/sdk';
import {
  DateActions,
  VisionFileFilterProps,
} from 'src/modules/FilterSidePanel/types';

export const calculateTotalSeconds = (time?: Date) =>
  time
    ? time.getSeconds() + time.getMinutes() * 60 + time.getHours() * 60 * 60
    : undefined;

export const validate = (timeRange: DateRange, itemTime?: Date): boolean => {
  if (itemTime === undefined) {
    return true;
  }
  const { min, max } = timeRange;
  const minTime = min ? new Date(min) : undefined;
  const maxTime = max ? new Date(max) : undefined;

  const secondsOfItem = calculateTotalSeconds(itemTime);
  const secondsOfMin = calculateTotalSeconds(minTime);
  const secondsOfMax = calculateTotalSeconds(maxTime);

  if (secondsOfItem !== undefined) {
    if (secondsOfMin && secondsOfMax) {
      return secondsOfItem >= secondsOfMin && secondsOfItem <= secondsOfMax;
    }
    if (secondsOfMin) {
      return secondsOfItem >= secondsOfMin;
    }
    if (secondsOfMax) {
      return secondsOfItem <= secondsOfMax;
    }
  }
  return true;
};

export const filterByTime = (
  visionFilter: VisionFileFilterProps,
  items: FileInfo[]
): FileInfo[] => {
  const {
    createdTime,
    uploadedTime,
    sourceCreatedTime,
    dateFilter,
    timeRange,
    ...filter
  } = visionFilter;

  // ignore time range if these are not defined
  if (!timeRange) {
    return items;
  }

  // filtering
  return items.filter((item) => {
    switch (dateFilter?.action) {
      case DateActions.created:
      default:
        return validate(timeRange, item.createdTime);
      case DateActions.uploaded:
        return validate(timeRange, item.uploadedTime);
      case DateActions.captured:
        return validate(timeRange, item.sourceCreatedTime);
    }
  }) as FileInfo[];
};
