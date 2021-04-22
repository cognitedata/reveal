import { combineReducers } from '@reduxjs/toolkit';
import { reducer as appReducer } from 'modules/app';
import { reducer as filesReducer } from 'modules/files';
import { reducer as assetsReducer } from 'modules/assets';
import { reducer as datasetsReducer } from 'modules/datasets';
import { reducer as workflowsReducer } from 'modules/workflows';
import { reducer as contextualizationReducer } from 'modules/contextualization';

const createRootReducer = () =>
  combineReducers({
    app: appReducer,
    assets: assetsReducer,
    files: filesReducer,
    datasets: datasetsReducer,
    workflows: workflowsReducer,
    contextualization: contextualizationReducer,
  });

export default createRootReducer;
export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
