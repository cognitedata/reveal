import {
  PreloadedState,
  Action,
  DeepPartial,
  Middleware,
  Dispatch as StoreDispatch,
} from 'redux';
import { RootState } from 'reducers';

export type PartialRootState = DeepPartial<RootState>;

export type PreloadedStoreState = PreloadedState<RootState>;

export type GetState = () => RootState;

export type StoreAction = Action<unknown>;

export type StoreMiddleware = Middleware<{}, RootState, StoreDispatch>;
