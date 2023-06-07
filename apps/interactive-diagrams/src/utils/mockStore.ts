import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RootState } from 'store';

export const mockStore = configureMockStore<
  Partial<RootState>,
  ThunkDispatch<any, undefined, AnyAction>
>([thunk]);
