import { combineReducers } from 'redux';
import { SuitesReducer } from './suites/reducer';
import { AuthReducer } from './auth/reducer';
import { ModalReducer } from './modals/reducer';
import { GroupsReducer } from './groups/reducer';

const rootReducer = combineReducers({
  suitesTable: SuitesReducer,
  auth: AuthReducer,
  modal: ModalReducer,
  groups: GroupsReducer,
});

export default rootReducer;
