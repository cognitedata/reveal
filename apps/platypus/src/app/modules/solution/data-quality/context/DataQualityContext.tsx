import React, { createContext } from 'react';

export type DataQualityState = {
  dataSourceId?: string;
};

export type ActionType = 'UPDATE_DATA_SOURCE_ID';

export const dataQualityInitialState: DataQualityState = {
  dataSourceId: undefined,
};

export type DataQualityAction = {
  type: ActionType;
  payload: Partial<DataQualityState>;
};

export const dataQualityReducer = (
  dataQualityState: DataQualityState,
  action: DataQualityAction
): DataQualityState => {
  switch (action.type) {
    case 'UPDATE_DATA_SOURCE_ID':
      return {
        ...dataQualityState,
        dataSourceId: action.payload.dataSourceId,
      };
    default:
      return dataQualityState;
  }
};

const DataQualityContext = createContext<{
  dataQualityState: DataQualityState;
  dispatchDataQuality: React.Dispatch<DataQualityAction>;
}>({
  dataQualityState: dataQualityInitialState,
  dispatchDataQuality: () => null,
});

export default DataQualityContext;
