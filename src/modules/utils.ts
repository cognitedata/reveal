import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import moment from 'moment';
import message from 'antd/lib/message';
import {
  loadResourceSelection,
  dataKitStatusSelectorFactory,
} from './selection';

export const loadDataKits = (...dataKitIds: string[]) => {
  return async (
    dispatch: ThunkDispatch<any, any, AnyAction>,
    getState: () => RootState
  ) => {
    return Promise.all(
      dataKitIds.map((dataKitId) => {
        const { done, loading } = dataKitStatusSelectorFactory(
          dataKitId,
          true
        )(getState());
        if (!done && !loading) {
          return dispatch(loadResourceSelection(dataKitId, true));
        }
        return Promise.resolve();
      })
    );
  };
};

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};

export const dateSorter = <A>(select: (x: A) => string) => {
  return function compare(a: A, b: A) {
    return moment(select(a)).diff(select(b));
  };
};

export const truncateString = (value: string, length: number) => {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length)}...`;
};

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText) {
    return true;
  }
  try {
    return value && value.toUpperCase().search(searchText.toUpperCase()) >= 0;
  } catch (e) {
    message.error('Invalid search term');
    return 'Invalid search term';
  }
};

export const getPipelineIdFromPath = (path: string): string | false => {
  const arrPath = path.split('/');
  const indexOfPipeline = arrPath.findIndex((item) => item === 'pipeline');
  const numberRegex = /^[0-9]*$/;

  if (
    arrPath[indexOfPipeline + 1] &&
    numberRegex.test(arrPath[indexOfPipeline + 1])
  ) {
    return arrPath[indexOfPipeline + 1];
  }
  return false;
};
