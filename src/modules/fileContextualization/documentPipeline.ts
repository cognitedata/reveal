import chunk from 'lodash/chunk';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers';
import { removeExtension } from 'utils/AnnotationUtils';
import { trackTimedUsage } from 'utils/Metrics';
import { FilesMetadata, Asset } from '@cognite/sdk';
import { Result } from 'modules/sdk-builder/types';
import { list as listAnnotations } from '../annotations';
import { startDocumentParsingJob } from './parsingJobs';
import { loadDataKits } from './utils';

const PIPELINE_STARTED = 'document/PIPELINE_STARTED';
const PIPELINE_DONE = 'document/PIPELINE_DONE';

interface PipelineStartedAction extends Action<typeof PIPELINE_STARTED> {
  fileDataKitId: string;
  assetDataKitId: string;
}
interface PipelineDoneAction extends Action<typeof PIPELINE_DONE> {
  fileDataKitId: string;
  assetDataKitId: string;
}

type PipelineAction = PipelineStartedAction | PipelineDoneAction;

export const startDocumentParsingPipeline = (
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
      'Contextualization.DocumentParsing.StartAllJobs',
      {
        fileDataKitId,
        assetDataKitId,
      }
    );

    dispatch({ type: PIPELINE_STARTED, fileDataKitId, assetDataKitId });

    const [assetsData, filesData] = await dispatch(
      loadDataKits(assetDataKitId, fileDataKitId)
    );

    const assetNames: string[] = (assetsData as Result<Asset>).items.map(
      i => i.name
    );
    const files: FilesMetadata[] = (filesData as Result<FilesMetadata>).items;

    chunk(files, 30).reduce(async (previousPromise: Promise<any>, nextSet) => {
      await previousPromise;
      return Promise.all(
        nextSet.map(async file => {
          // fetch deleted too
          await dispatch(listAnnotations(file, true, true));
          await dispatch(
            startDocumentParsingJob(
              file,
              assetNames.concat(
                files
                  .filter(el => el.id !== file.id)
                  .map(el => el.name)
                  .map(removeExtension)
              ),
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

interface PipelineStatus {
  completed: boolean;
  assetsDataKitId: string;
  filesDataKitId: string;
}

export interface DocumentParsingPipelineStore {
  [key: string]: PipelineStatus;
}

export const docPipelineReducer = (
  state: DocumentParsingPipelineStore = {},
  action: PipelineAction
): DocumentParsingPipelineStore => {
  switch (action.type) {
    case PIPELINE_STARTED: {
      const key = `${action.fileDataKitId}-${action.assetDataKitId}`;
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
      const key = `${action.fileDataKitId}-${action.assetDataKitId}`;
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
    default: {
      return state;
    }
  }
};
