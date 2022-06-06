import { AppliedFilters } from './types';

export enum NdsViewModes {
  Treemap = 'Treemap',
  Table = 'Table',
}

export const EMPTY_APPLIED_FILTERS: AppliedFilters = {
  riskType: {},
  severity: [],
  probability: [],
};
