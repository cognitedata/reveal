import { WELL_PROPERTY_FILTER_IDS } from './constants';

export type WellPropertyFilterIDs = typeof WELL_PROPERTY_FILTER_IDS[number];

export type WellPropertyFilterGroup = Record<
  WellPropertyFilterIDs,
  Array<string>
>;

export type WellPropertyFilters = Record<
  WellPropertyFilterIDs,
  Record<string, WellPropertyFilterGroup>
>;

export type WellPropertyHierarchy = Record<
  WellPropertyFilterIDs,
  {
    parents: WellPropertyFilterIDs[];
    children: WellPropertyFilterIDs[];
  }
>;
