import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { MetadataItem } from 'src/pages/Preview/components/MetaDataTable/MetadataTable';
import { v3 } from '@cognite/cdf-sdk-singleton';

export interface VisionAnnotationState extends VisionAnnotation {
  id: string;
  modelId: string;
  color: string;
  show: boolean;
}

interface VisionModelState {
  modelId: string;
  fileId: string;
  modelType: DetectionModelType;
  annotations: string[];
}

type FileInfoValueState = string | v3.Label[] | null | undefined;

type State = {
  annotations: {
    byId: Record<string, VisionAnnotationState>;
    allIds: string[];
  };
  models: {
    byId: Record<string, VisionModelState>;
    allIds: string[];
  };
  modelsByFileId: Record<string, string[]>;
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
};

const initialState: State = {
  annotations: {
    byId: {},
    allIds: [],
  },
  models: {
    byId: {},
    allIds: [],
  },
  modelsByFileId: {},
  metadataEdit: false,
  fileDetails: {},
  fileMetaData: {},
};

const processUpdate = createAction<{
  fileId: string | number;
  job: AnnotationJob;
}>('processSlice/updateJob');

const previewSlice = createSlice({
  name: 'previewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    toggleAnnotationVisibility(
      state,
      action: PayloadAction<{
        annotationId: string;
      }>
    ) {
      const id = action.payload.annotationId;
      const visibility = state.annotations.byId[id].show;
      state.annotations.byId[id].show = !visibility;
    },
    annotationApproval(
      state,
      action: PayloadAction<{
        annotationId: string;
        status: AnnotationStatus;
      }>
    ) {
      const { status, annotationId } = action.payload;
      const annotation = state.annotations.byId[annotationId];

      annotation.status = status;

      if (status === AnnotationStatus.Deleted) {
        // delete annotation if deleted
        const models = state.models.byId[annotation.modelId];
        models.annotations = models.annotations.filter(
          (item) => item !== annotation.id
        );
        delete state.annotations.byId[annotation.id];
      }
    },
    toggleMetaDataTableEditMode(state, action: PayloadAction<MetadataItem[]>) {
      const editMode = state.metadataEdit;

      if (editMode) {
        // filter empty keys when finishing edit mode
        const metaRowKeys = Object.keys(state.fileMetaData);
        metaRowKeys.forEach((rowKey) => {
          const metaKey = state.fileMetaData[parseInt(rowKey, 10)].key;
          if (!metaKey) {
            delete state.fileMetaData[parseInt(rowKey, 10)];
          }
        });
      } else {
        // set metadata when starting edit mode
        state.fileMetaData = {};
        action.payload.forEach((item, index) => {
          state.fileMetaData[index] = item;
        });
      }
      state.metadataEdit = !editMode;
    },
    fileInfoEdit(
      state,
      action: PayloadAction<{
        key: string;
        value: FileInfoValueState;
      }>
    ) {
      state.fileDetails[action.payload.key] = action.payload.value;
    },
    fileMetaDataEdit(
      state,
      action: PayloadAction<{
        index: number;
        key: string;
        value: string;
      }>
    ) {
      state.fileMetaData[action.payload.index] = {
        key: action.payload.key,
        value: action.payload.value || '',
      };
    },
    fileMetaDataAddRow(state, action: PayloadAction<MetadataItem[]>) {
      state.metadataEdit = true;
      state.fileMetaData = {};
      const metaLength = Object.keys(action.payload).length;
      action.payload.forEach((item, index) => {
        state.fileMetaData[index] = item;
      });
      state.fileMetaData[metaLength] = { key: '', value: '' };
    },
    resetEditHistory(state) {
      state.metadataEdit = false;
      state.fileMetaData = {};
      state.fileDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(processUpdate, (state, { payload }) => {
      const { job, fileId } = payload;

      if (job.status === 'Completed') {
        if (!state.modelsByFileId[fileId]) {
          state.modelsByFileId[fileId] = [];
        }

        // update model
        const modelId = AnnotationUtils.getModelId(String(fileId), job.type);

        const fileModelArr = state.modelsByFileId[fileId];

        if (fileModelArr && !fileModelArr.includes(modelId)) {
          fileModelArr.push(modelId);
        }

        state.models.byId[modelId] = {
          modelId,
          modelType: job.type,
          fileId: fileId.toString(),
          annotations: [],
        };

        state.models.allIds = Object.keys(state.models.byId);

        const { annotations } = job.items[0];
        const visionAnnotations = AnnotationUtils.convertToAnnotations(
          fileId.toString(),
          annotations,
          job.type
        );

        visionAnnotations.forEach((item) => {
          const id = AnnotationUtils.generateAnnotationId(
            String(fileId),
            job.type,
            item.displayId
          );
          state.models.byId[modelId].annotations.push(id);
          state.annotations.byId[id] = {
            id,
            ...item,
            modelId,
            show: true,
          };
        });

        state.annotations.allIds = Object.keys(state.annotations.byId);
      }
    });
  },
});

export default previewSlice.reducer;
export const {
  toggleAnnotationVisibility,
  annotationApproval,
  toggleMetaDataTableEditMode,
  fileInfoEdit,
  fileMetaDataEdit,
  fileMetaDataAddRow,
  resetEditHistory,
} = previewSlice.actions;

export const selectModelIdsByFileId = (
  state: State,
  fileId: string
): string[] => state.modelsByFileId[fileId] || [];

export const modelsById = (state: State): { [id: string]: VisionModelState } =>
  state.models.byId;

export const selectModelsByFileId = createSelector(
  modelsById,
  selectModelIdsByFileId,
  (allModels, modelIdsByFile) => {
    return modelIdsByFile.map((id) => {
      return allModels[id];
    });
  }
);

export const annotationsById = (
  state: State
): { [id: string]: VisionAnnotationState } => state.annotations.byId;

export const selectAnnotationsByFileId = createSelector(
  annotationsById,
  selectModelsByFileId,
  (allAnnotations, modelsByFile) => {
    return modelsByFile
      .map((model) => {
        return model.annotations;
      })
      .reduce((acc, annotations) => {
        return acc.concat(annotations);
      }, [])
      .map((id) => allAnnotations[id]);
  }
);

export const selectNonRejectedAnnotations = createSelector(
  selectAnnotationsByFileId,
  (annotationIdsByFile) => {
    return annotationIdsByFile.filter(
      (item) => item.status !== AnnotationStatus.Deleted
    );
  }
);

export const selectVisibleAnnotationsByFileId = createSelector(
  selectAnnotationsByFileId,
  (annotationIdsByFile) => {
    return annotationIdsByFile.filter((item) => item.show);
  }
);
