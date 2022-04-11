import {
  Action,
  Dispatch as StoreDispatch,
  Store,
  PreloadedState,
} from 'redux';
import { ThunkDispatch as ReduxThunkDispatch, ThunkAction } from 'redux-thunk';

import { DocumentState } from 'modules/documentSearch/types';
import { DocumentAction } from 'modules/documentSearch/types.actions';
import { FavoriteState } from 'modules/favorite/types';
import { FeedbackState, FeedbackAction } from 'modules/feedback/types';
import { InspectTabsAction, InspectTabsState } from 'modules/inspectTabs/types';
import { MapState } from 'modules/map/types';
import { MapAction } from 'modules/map/types.actions';
import {
  ResultPanelState,
  ResultPanelActions,
} from 'modules/resultPanel/types';
import { SearchAction } from 'modules/search/actions';
import { SearchState } from 'modules/search/types';
import { SeismicState } from 'modules/seismicSearch/types';
import { SeismicAction } from 'modules/seismicSearch/types.actions';
import { SidebarState, SidebarActions } from 'modules/sidebar/types';
import { UserAction, UserState } from 'modules/user/types';
import { WellInspectAction, WellInspectState } from 'modules/wellInspect/types';
import { WellState, WellSearchAction } from 'modules/wellSearch/types';

export type StoreAction =
  | DocumentAction
  | FeedbackAction
  | InspectTabsAction
  | MapAction
  | SearchAction
  | SeismicAction
  | UserAction
  | WellSearchAction
  | SidebarActions
  | ResultPanelActions
  | WellInspectAction;

export type StoreState = {
  environment: {
    tenant: string;
    appName: string;
  };
  favorites: FavoriteState;
  feedback: FeedbackState;
  inspectTabs: InspectTabsState;
  map: MapState;
  search: SearchState;
  documentSearch: DocumentState;
  seismicSearch: SeismicState;
  user: UserState;
  wellSearch: WellState;
  sidebar: SidebarState;
  resultPanel: ResultPanelState;
  wellInspect: WellInspectState;
};

export type ThunkResult<R> = ThunkAction<R, StoreState, undefined, StoreAction>;
export type ThunkDispatch = ReduxThunkDispatch<StoreState, void, Action>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>;
};

export type PartialStoreState = DeepPartial<StoreState>;
export type Dispatch = StoreDispatch<StoreAction>;
export type PreloadedStoreState = PreloadedState<StoreState>;

export type AppStore = Store<StoreState, StoreAction>;

// for when you want to quickly convert a file,
// and want to remember to put in real types later on
export type TS_FIX_ME = any;
