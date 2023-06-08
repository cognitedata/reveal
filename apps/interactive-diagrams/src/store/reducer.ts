import { reducer as assetsReducer } from '@interactive-diagrams-app/modules/assets';
import { reducer as datasetsReducer } from '@interactive-diagrams-app/modules/datasets';
import { reducer as filesReducer } from '@interactive-diagrams-app/modules/files';
import { reducer as svgConvertReducer } from '@interactive-diagrams-app/modules/svgConvert';
import { reducer as workflowsReducer } from '@interactive-diagrams-app/modules/workflows';
import { combineReducers } from '@reduxjs/toolkit';

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
