import { ContainsAllFilter } from './contains-all-filter';
import { ContainsAnyFilter } from './contains-any-filter';
import { EqualsFilter } from './equals-filter';
import { ExistsFilter } from './exists-filter';
import { HasDataFilter } from './has-data-filter';
import { InFilter } from './in-filter';
import { NestedFilter } from './nested-filter';
import { OverlapsFilter } from './overlaps-filter';
import { PrefixFilter } from './prefix-filter';
import { RangeFilter } from './range-filter';

export type Filter = BoolFilter | LeafFilter;

export type LeafFilter =
  | EqualsFilter
  | InFilter
  | RangeFilter
  | PrefixFilter
  | ExistsFilter
  | ContainsAnyFilter
  | ContainsAllFilter
  | NestedFilter
  | OverlapsFilter
  | HasDataFilter;

export type BoolFilter = AndFilter | NotFilter | OrFilter;
export interface AndFilter {
  and: Array<Filter>;
}
export interface NotFilter {
  not: Array<Filter>;
}
export interface OrFilter {
  or: Array<Filter>;
}
