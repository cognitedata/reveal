import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import { loadResourceSelection, dataKitItemsSelector } from '../selection';

export const loadDataKits = (...dataKitIds: string[]) => {
  return async (
    dispatch: ThunkDispatch<any, any, AnyAction>,
    getState: () => RootState
  ) => {
    return Promise.all(
      dataKitIds.map(async dataKitId => {
        let data = dataKitItemsSelector(getState())(dataKitId, true);

        if (!data.done) {
          await dispatch(loadResourceSelection(dataKitId));

          data = dataKitItemsSelector(getState())(dataKitId, true);
        }
        return data;
      })
    );
  };
};
