import { RootState } from '@interactive-diagrams-app/store';
import { AnyAction } from 'redux';
import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';

export const mockStore = configureMockStore<
  Partial<RootState>,
  ThunkDispatch<any, undefined, AnyAction>
>([thunk]);
