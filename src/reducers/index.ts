import { combineReducers } from 'redux';

import retrieveFunctionsReducer from 'modules/retrieve';
import createFunctionReducer from 'modules/create';
import callFunctionReducer from 'modules/call';
import deleteFunctionReducer from 'modules/delete';
import functionCallsReducer from 'modules/functionCalls';
import schedulesReducer from 'modules/schedules';
import responseReducer from 'modules/response';
import appReducer from 'modules/app';

const createRootReducer = () =>
  combineReducers({
    app: appReducer,
    items: retrieveFunctionsReducer,
    create: createFunctionReducer,
    call: callFunctionReducer,
    delete: deleteFunctionReducer,
    allCalls: functionCallsReducer,
    schedules: schedulesReducer,
    response: responseReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
