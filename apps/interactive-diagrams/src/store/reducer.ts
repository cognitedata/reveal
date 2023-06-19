import { combineReducers } from '@reduxjs/toolkit';

import { reducer as assetsReducer } from '../modules/assets';
import { reducer as datasetsReducer } from '../modules/datasets';
import { reducer as filesReducer } from '../modules/files';
import { reducer as svgConvertReducer } from '../modules/svgConvert';
import { reducer as workflowsReducer } from '../modules/workflows';

const createRootReducer = () =>
  combineReducers({
    assets: assetsReducer,
    files: filesReducer,
    datasets: datasetsReducer,
    workflows: workflowsReducer,
    svgConvert: svgConvertReducer,
  });

export default createRootReducer;
export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
