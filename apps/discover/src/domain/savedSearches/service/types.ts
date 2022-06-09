import { BaseAPIResult } from '../../../services/types';
import { SavedSearchContent } from '../types';

export interface SavedSearchListResponse extends BaseAPIResult {
  data: {
    list: Record<string, SavedSearchContent>;
  };
}
export interface SavedSearchGetResponse extends BaseAPIResult {
  data: {
    error: boolean;
    data: SavedSearchContent;
  };
}
export interface SavedSearchSaveResponse extends BaseAPIResult {
  data: {
    savedSearch: SavedSearchContent;
  };
}
