import chunk from 'lodash/chunk';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import { removeExtension } from 'utils/AnnotationUtils';
import { trackTimedUsage } from 'utils/Metrics';
import { FileInfo, Asset } from '@cognite/sdk';
import { dataKitItemsSelectorFactory } from 'modules/selection';
import { list as listAnnotations } from '../annotations';
import { startPnidParsingJob, resetPnidParsingJobs } from './parsingJobs';
import { loadDataKits } from './utils';

const PIPELINE_STARTED = 'pnid/PIPELINE_STARTED';
const PIPELINE_DONE = 'pnid/PIPELINE_DONE';
const PIPELINE_RESET = 'pnid/PIPELINE_RESET';
const PNID_OPTIONS = 'pnid/PNID_OPTIONS';

interface PipelineStartedAction extends Action<typeof PIPELINE_STARTED> {
  fileDataKitId: string;
  assetDataKitId: string;
}
interface PipelineDoneAction extends Action<typeof PIPELINE_DONE> {
  fileDataKitId: string;
  assetDataKitId: string;
}
interface PipelineResetAction extends Action<typeof PIPELINE_RESET> {
  fileDataKitId: string;
  assetDataKitId: string;
}

type PipelineAction =
  | PipelineStartedAction
  | PipelineDoneAction
  | PipelineResetAction;

interface PnIDOptions extends Action<typeof PNID_OPTIONS> {
  partialMatch: boolean;
  grayscale: boolean;
  minTokens: number;
}

type PnIDOptionsActions = PnIDOptions;

export const startPnidParsingPipeline = (
  fileDataKitId: string,
  assetDataKitId: string
) => {
  return async (
    dispatch: ThunkDispatch<any, any, PipelineAction>,
    getState: () => RootState
  ) => {
    if (
      getState().fileContextualization.pnidPipelines[
        `${fileDataKitId}-${assetDataKitId}`
      ]
    ) {
      return;
    }

    const timer = trackTimedUsage(
      'Contextualization.PnidParsing.StartAllJobs',
      {
        fileDataKitId,
        assetDataKitId,
      }
    );

    const {
      partialMatch,
      grayscale,
      minTokens,
    } = getState().fileContextualization.pnidOption;

    dispatch({ type: PIPELINE_STARTED, fileDataKitId, assetDataKitId });

    await dispatch(loadDataKits(assetDataKitId, fileDataKitId));

    const getAssets = dataKitItemsSelectorFactory(assetDataKitId, true);
    const getFiles = dataKitItemsSelectorFactory(fileDataKitId, true);

    const assets = getAssets(getState()) as Asset[];
    const assetNames: string[] = assets.map((i) => i.name);
    const files = getFiles(getState()) as FileInfo[];

    chunk(files, 30).reduce(async (previousPromise: Promise<any>, nextSet) => {
      await previousPromise;
      return Promise.all(
        nextSet.map(async (file) => {
          // fetch deleted too
          await dispatch(listAnnotations(file, true, true));
          await dispatch(
            startPnidParsingJob(
              file,
              assetNames.concat(
                files
                  .filter((el) => el.id !== file.id)
                  .map((el) => el.name)
                  .map(removeExtension)
              ),
              { partialMatch, grayscale, minTokens },
              assetDataKitId,
              fileDataKitId
            )
          );
        })
      );
    }, Promise.resolve());

    dispatch({ type: PIPELINE_DONE, fileDataKitId, assetDataKitId });

    timer.stop();
  };
};

export const resetPnidParsingPipeline = (
  fileDataKitId: string,
  assetDataKitId: string
) => {
  return async (
    dispatch: ThunkDispatch<any, any, PipelineAction>,
    getState: () => RootState
  ) => {
    if (
      getState().fileContextualization.pnidPipelines[
        `${fileDataKitId}-${assetDataKitId}`
      ]
    ) {
      dispatch(resetPnidParsingJobs(assetDataKitId));
      dispatch({
        type: PIPELINE_RESET,
        fileDataKitId,
        assetDataKitId,
      });
    }
  };
};
export const setOptions = (options: {
  partialMatch?: boolean;
  grayscale?: boolean;
  minTokens?: number;
}) => ({
  type: PNID_OPTIONS,
  ...options,
});

interface PipelineStatus {
  completed: boolean;
  assetsDataKitId: string;
  filesDataKitId: string;
}

export interface PnidParsingPipelineStore {
  [key: string]: PipelineStatus;
}

export interface PnidOptionStore {
  partialMatch: boolean;
  grayscale: boolean;
  minTokens: number;
}

export const pnidPipelineReducer = (
  state: PnidParsingPipelineStore = {},
  action: PipelineAction
): PnidParsingPipelineStore => {
  const key = `${action.fileDataKitId}-${action.assetDataKitId}`;
  switch (action.type) {
    case PIPELINE_STARTED: {
      return {
        ...state,
        [key]: {
          completed: false,
          filesDataKitId: action.fileDataKitId,
          assetsDataKitId: action.assetDataKitId,
        },
      };
    }
    case PIPELINE_DONE: {
      return {
        ...state,
        [key]: {
          ...state[key],
          completed: true,
          filesDataKitId: action.fileDataKitId,
          assetsDataKitId: action.assetDataKitId,
        },
      };
    }
    case PIPELINE_RESET: {
      const next = { ...state };
      delete next[key];
      return next;
    }
    default: {
      return state;
    }
  }
};

export const pnidOptionReducer = (
  state: PnidOptionStore = {
    partialMatch: false,
    grayscale: false,
    minTokens: 2,
  },
  action: PnIDOptionsActions
): PnidOptionStore => {
  switch (action.type) {
    case PNID_OPTIONS: {
      const partialMatch =
        action.partialMatch !== undefined
          ? action.partialMatch
          : state.partialMatch;
      const grayscale =
        action.grayscale !== undefined ? action.grayscale : state.grayscale;
      return {
        ...state,
        partialMatch,
        grayscale,
        minTokens: action.minTokens ? action.minTokens : state.minTokens,
      };
    }
    default: {
      return state;
    }
  }
};
