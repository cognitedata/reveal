import { getCluster, getEnv } from '@cognite/cdf-utilities';

import {
  JOURNEY_FIELD,
  JOURNEY_ITEM_SEPARATOR,
  SELECTED_TAB_FIELD,
} from '../constants';
import { JourneyItem, ResourceType, ResourceTypes } from '../types';

// We have these functions in case in the future we would like to set ...
// ... different journey types than resource types.
// i.e. 'a-123' instead of 'asset-123'
const getJourneyItemTypeFromResourceType = (
  resourceType: ResourceType | undefined
): string => {
  switch (resourceType) {
    case 'asset':
      return ResourceTypes.Asset;
    case 'timeSeries':
      return ResourceTypes.TimeSeries;
    case 'file':
      return ResourceTypes.File;
    case 'event':
      return ResourceTypes.Event;
    case 'sequence':
      return ResourceTypes.Sequence;
    case 'threeD':
      return ResourceTypes.ThreeD;
    default:
      return 'unknown-resource-type';
  }
};

const getResourceTypeFromJourneyItemType = (
  itemType: string
): ResourceType | undefined => {
  switch (itemType) {
    case ResourceTypes.Asset:
      return 'asset';
    case ResourceTypes.TimeSeries:
      return 'timeSeries';
    case ResourceTypes.File:
      return 'file';
    case ResourceTypes.Event:
      return 'event';
    case ResourceTypes.Sequence:
      return 'sequence';
    case ResourceTypes.ThreeD:
      return 'threeD';
    default:
      return undefined;
  }
};

export const getStringFromJourneyItem = (item: JourneyItem): string => {
  const itemType = getJourneyItemTypeFromResourceType(item.type);
  const initialTab = item.initialTab
    ? `${JOURNEY_ITEM_SEPARATOR}${item.initialTab}`
    : '';
  return `${itemType}${JOURNEY_ITEM_SEPARATOR}${item.id}${initialTab}`;
};

export const getJourneyItemFromString = (item: string): JourneyItem => {
  const rawItem = item.split(JOURNEY_ITEM_SEPARATOR);
  return {
    type: getResourceTypeFromJourneyItemType(rawItem[0]),
    id: Number(rawItem[1]),
    initialTab: rawItem.length > 1 ? rawItem[2] : undefined,
  };
};

export const getSearchParamsWithJourney = (journeyItem: JourneyItem) => {
  return `?cluster=${getCluster()}&env=${getEnv()}&${JOURNEY_FIELD}=${getStringFromJourneyItem(
    journeyItem
  )}`;
};

export const getSearchParamsWithJourneyAndSelectedTab = (
  journeyItem: JourneyItem,
  selectedTab: string
) => {
  return `?cluster=${getCluster()}&env=${getEnv()}&${JOURNEY_FIELD}=${getStringFromJourneyItem(
    journeyItem
  )}&${SELECTED_TAB_FIELD}=${selectedTab}`;
};

export const getSelectedResourceId = (
  selectedResourceType: ResourceType,
  journeyItem?: JourneyItem
) => {
  if (journeyItem && journeyItem.type === selectedResourceType) {
    return journeyItem.id;
  }

  return undefined;
};
