import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AssetListScope, FilesSearchFilter } from '@cognite/sdk';
import { ResourceType, Filter } from 'modules/sdk-builder/types';
import {
  list as listAssets,
  search as searchAssets,
  count as countAssets,
} from './assets';
import {
  list as listFiles,
  search as searchFiles,
  count as countFiles,
} from './files';

const searchOrListAssets = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countAssets({ filter: q }));
  if (q.search) {
    dispatch(searchAssets({ filter: q }));
  } else if (q.filter) {
    dispatch(listAssets({ filter: q as AssetListScope }));
  }
};

const searchOrListFiles = (q: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  dispatch(countFiles({ filter: q }));
  if (q.search) {
    dispatch(searchFiles({ filter: q }));
  } else if (q.filter) {
    dispatch(listFiles({ filter: q as FilesSearchFilter }));
  }
};

export const doSearch = (type: ResourceType, filter: Filter) => async (
  dispatch: ThunkDispatch<any, void, AnyAction>
) => {
  switch (type) {
    case 'assets': {
      dispatch(searchOrListAssets(filter));
      break;
    }
    case 'files': {
      dispatch(searchOrListFiles(filter));
      break;
    }

    default: {
      throw new Error(`Unsupported ResourceType: ${type}`);
    }
  }
};
