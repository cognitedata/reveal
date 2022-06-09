import { SavedSearchContent } from 'services/savedSearches/types';

import { OptionType } from '@cognite/cogs.js';

export type SearchHistoryFilter = {
  label: 'documents' | 'wells' | 'geoJson';
  values: string[];
};

export interface SearchHistoryOptionType<ValueType>
  extends OptionType<ValueType> {
  data: SavedSearchContent;
}
