import { combineReducers } from 'redux';
import { SuitesReducer } from './suites/reducer';
import { AuthReducer } from './auth/reducer';
import { ModalReducer } from './modals/reducer';

const rootReducer = combineReducers({
  suitesTable: SuitesReducer,
  auth: AuthReducer,
  modal: ModalReducer,
});

export default rootReducer;
