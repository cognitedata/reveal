import { combineReducers } from 'redux';
import { SuitesReducer } from './suites/reducer';
import { AuthReducer } from './auth/reducer';
import { ModalReducer } from './modals/reducer';
import { GroupsReducer } from './groups/reducer';
import { UserSpaceReducer } from './userSpace/reducer';
import { FormReducer } from './forms/reducer';
import { NotificationReducer } from './notification/reducer';
import { ConfigReducer } from './config/reducer';
import { LayoutReducer } from './layout/reducer';

const rootReducer = combineReducers({
  suitesTable: SuitesReducer,
  auth: AuthReducer,
  modal: ModalReducer,
  groups: GroupsReducer,
  userSpace: UserSpaceReducer,
  form: FormReducer,
  notification: NotificationReducer,
  config: ConfigReducer,
  layout: LayoutReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
