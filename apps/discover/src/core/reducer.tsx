import { combineReducers } from 'redux';

import { search as documentSearch } from 'modules/documentSearch/reducer';
import favorites from 'modules/favorite/reducer';
import { feedback } from 'modules/feedback/reducer';
import { inspectTabs } from 'modules/inspectTabs/reducer';
import { map } from 'modules/map/reducer';
import { resultPanel } from 'modules/resultPanel/reducer';
import { search } from 'modules/search/reducer';
import { seismic } from 'modules/seismicSearch/reducer';
import { sidebar } from 'modules/sidebar/reducer';
import { user } from 'modules/user/reducer';
import wellInspect from 'modules/wellInspect/reducer';
import { wellReducer } from 'modules/wellSearch/reducer';

import { StoreState } from './types';

const rootReducer = combineReducers<StoreState>({
  environment: (state): StoreState['environment'] => {
    return { ...state } as StoreState['environment'];
  },
  favorites,
  feedback,
  inspectTabs,
  map,
  search,
  documentSearch,
  seismicSearch: seismic,
  wellSearch: wellReducer,
  user,
  sidebar,
  resultPanel,
  wellInspect,
});

export default rootReducer;
