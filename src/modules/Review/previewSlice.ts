import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import {
  addAnnotations,
  clearFileState,
  deleteAnnotationsFromState,
} from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/AnnotationDetectionJobUpdate';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';
import { RootState } from 'src/store/rootReducer';
import { createFileInfo } from 'src/store/util/StateUtils';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

export interface VisionAnnotationState extends Omit<VisionAnnotation, 'id'> {
  id: number;
  modelId: string;
  color: string;
  show: boolean;
}

export interface VisibleAnnotation extends VisionAnnotationState {
  selected?: boolean;
}

export interface VisionModelState {
  modelId: string;
  fileId: number;
  modelType: VisionAPIType;
  annotations: number[];
}

type State = {
  fileIds: number[];
  selectedAnnotationIds: number[];
  annotations: {
    counter: number;
    byId: Record<number, VisionAnnotationState>;
    allIds: string[];
  };
  models: {
    byId: Record<string, VisionModelState>;
    allIds: string[];
  };
  modelsByFileId: Record<string, string[]>;
  showCollectionSettings: boolean;
};

const initialState: State = {
  fileIds: [],
  selectedAnnotationIds: [],
  annotations: {
    counter: 0,
    byId: {},
    allIds: [],
  },
  models: {
    byId: {},
    allIds: [],
  },
  modelsByFileId: {},
  showCollectionSettings: false,
};

const previewSlice = createSlice({
  name: 'previewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setReviewFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    toggleAnnotationVisibility(
      state,
      action: PayloadAction<{
        annotationId: number;
      }>
    ) {
      const id = action.payload.annotationId;
      const visibility = state.annotations.byId[id].show;
      state.annotations.byId[id].show = !visibility;
    },
    selectAnnotation(state, action: PayloadAction<number>) {
      const annotationId = action.payload;
      state.selectedAnnotationIds = [annotationId];
    },
    deselectAllAnnotations(state) {
      state.selectedAnnotationIds = [];
    },
    addTagAnnotations(state, action: PayloadAction<VisionAnnotation[]>) {
      if (!action.payload.length) {
        return;
      }
      const modelId = AnnotationUtils.getModelId(
        String(action.payload[0].annotatedResourceId),
        VisionAPIType.TagDetection
      );
      const model = state.models.byId[modelId];
      const tagAnnotations =
        model?.annotations.map((annId) => state.annotations.byId[annId]) || [];
      const freshTagAnnotations: VisionAnnotation[] = [];

      action.payload.forEach((linkedAnnotation) => {
        const annWithSameAsset =
          tagAnnotations.find(
            (ann) => ann.linkedResourceId === linkedAnnotation.linkedResourceId
          ) ||
          tagAnnotations.find(
            (ann) =>
              ann.linkedResourceExternalId ===
              linkedAnnotation.linkedResourceExternalId
          );

        if (annWithSameAsset) {
          state.annotations.byId[annWithSameAsset.id] = {
            ...annWithSameAsset,
            ...createVisionAnnotationState(
              linkedAnnotation,
              annWithSameAsset.id!,
              modelId,
              true
            ),
            createdTime: annWithSameAsset.createdTime,
            lastUpdatedTime: annWithSameAsset.lastUpdatedTime,
          };
        } else {
          freshTagAnnotations.push(linkedAnnotation);
        }
      });

      if (freshTagAnnotations.length) {
        addEditAnnotationsToState(state, freshTagAnnotations);
      }
    },
    showCollectionSettingsModel(state, action: PayloadAction<boolean>) {
      state.showCollectionSettings = action.payload;
    },
    resetPreview(state) {
      resetPreviewState(state);
    },
    resetReviewPage(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteAnnotationsFromState, (state, { payload }) => {
      deleteAnnotationsByIds(state, payload);
    });

    // Matchers

    builder.addMatcher(
      isAnyOf(deleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        action.payload.forEach((fileId) => {
          const models = state.modelsByFileId[fileId];
          if (models !== undefined) {
            // In case deleting files before running models
            models.forEach((modelId) => {
              const modelState = state.models.byId[modelId];
              const { annotations } = modelState;

              annotations.forEach((annotationId) => {
                delete state.annotations.byId[annotationId];
              });
              state.annotations.allIds = Object.keys(state.annotations.byId);

              delete state.models.byId[modelId];
            });
          }
          state.models.allIds = Object.keys(state.models.byId);

          delete state.modelsByFileId[fileId];
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        addAnnotations,
        CreateAnnotations.fulfilled,
        AnnotationDetectionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled,
        RetrieveAnnotations.fulfilled
      ),
      (state, action) => {
        addEditAnnotationsToState(state, action.payload);
      }
    );
  },
});

export default previewSlice.reducer;
export const {
  setReviewFileIds,
  toggleAnnotationVisibility,
  selectAnnotation,
  deselectAllAnnotations,
  addTagAnnotations,
  showCollectionSettingsModel,
  resetPreview,
} = previewSlice.actions;

// state helper functions

const resetPreviewState = (state: State) => {
  state.selectedAnnotationIds = [];
};

export const addEditAnnotationsToState = (
  state: State,
  annotations: VisionAnnotation[]
) => {
  annotations.forEach((item) => {
    // update models
    const { modelType } = item;
    const modelId = AnnotationUtils.getModelId(
      String(item.annotatedResourceId),
      modelType
    );
    const fileId = item.annotatedResourceId;

    if (!state.models.byId[modelId]) {
      state.models.byId[modelId] = {
        modelId,
        modelType,
        fileId,
        annotations: [],
      };

      state.models.allIds = Object.keys(state.models.byId);

      // update file models
      const fileModels = state.modelsByFileId[fileId];
      if (!fileModels) {
        state.modelsByFileId[fileId] = [modelId];
      } else if (fileModels && !fileModels.includes(modelId)) {
        fileModels.push(modelId);
      }
    }

    const { id } = item;

    const annotation = state.annotations.byId[id];
    if (annotation) {
      state.annotations.byId[id] = {
        ...annotation,
        ...createVisionAnnotationState(item, id, modelId, true),
      };
    } else {
      if (state.models.byId[modelId].annotations.includes(id)) {
        // todo: remove this check after development complete
        // eslint-disable-next-line no-console
        console.error(
          'possible Error! annotation not available but available in model ids'
        );
      }

      state.models.byId[modelId].annotations.push(id);

      state.annotations.byId[id] = createVisionAnnotationState(
        item,
        id,
        modelId,
        true
      );
    }
  });

  state.annotations.allIds = Object.keys(state.annotations.byId);
};

const deleteAnnotationsByIds = (state: State, annotationIds: number[]) => {
  annotationIds.forEach((annId) => {
    const annotation = state.annotations.byId[annId];
    const model = state.models.byId[annotation.modelId];
    model.annotations = model.annotations.filter(
      (item) => item !== annotation.id
    );
    delete state.annotations.byId[annotation.id];
    state.annotations.allIds = Object.keys(state.annotations.byId);
  });
  state.selectedAnnotationIds = state.selectedAnnotationIds.filter(
    (id) => !annotationIds.includes(id)
  );
};

// selectors

export const selectAllReviewFiles = createSelector(
  (state: RootState) => state.filesSlice.files.byId,
  (state: RootState) => state.previewSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectModelIdsByFileId = createSelector(
  (state: State) => state,
  (_: State, fileId: string) => fileId,
  (state, fileId) => {
    const models = state.modelsByFileId[fileId] || [];
    return models;
  }
);

export const modelsById = createSelector(
  (state: State) => state,
  (state: State) => {
    return state.models.byId;
  }
);

export const selectModelsByFileId = createSelector(
  modelsById,
  selectModelIdsByFileId,
  (allModels, modelIdsByFile) => {
    return modelIdsByFile.map((id) => {
      return allModels[id];
    });
  }
);

export const annotationsById = createSelector(
  (state: State) => state,
  (state: State) => {
    return state.annotations.byId;
  }
);

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

export const selectAnnotationsByFileIdModelType = createSelector(
  selectAnnotationsByFileId,
  selectModelsByFileId,
  (_, fileId: string, modelType: VisionAPIType) => modelType,
  (allAnnotations, models, modelType) => {
    const modelId = models.find(
      (item) => item.modelType === modelType
    )?.modelId;

    if (modelId) {
      return allAnnotations.filter((item) => item.modelId === modelId);
    }
    return [];
  }
);

export const selectTagAnnotationsByFileIdModelType = createSelector(
  (state: State, fileId: string) =>
    selectAnnotationsByFileIdModelType(
      state,
      fileId,
      VisionAPIType.TagDetection
    ),
  (tagAnnotations) => {
    return tagAnnotations;
  }
);

export const selectOtherAnnotationsByFileIdModelType = createSelector(
  (state: State, fileId: string) =>
    selectAnnotationsByFileIdModelType(
      state,
      fileId,
      VisionAPIType.ObjectDetection
    ),
  (state: State, fileId: string) =>
    selectAnnotationsByFileIdModelType(state, fileId, VisionAPIType.OCR),
  (objectAnnotations, textAnnotations) => {
    return objectAnnotations.concat(textAnnotations);
  }
);

export const selectVisibleAnnotationsByFileId = createSelector(
  selectAnnotationsByFileId,
  (annotationIdsByFile) => {
    return annotationIdsByFile.filter((item) => !!item.region && item.show);
  }
);

export const selectVisibleNonRejectedAnnotationsByFileId = createSelector(
  selectVisibleAnnotationsByFileId,
  (visibleAnnotationIdsByFile) => {
    return visibleAnnotationIdsByFile.filter(
      (item) => item.status !== AnnotationStatus.Rejected
    );
  }
);

const createVisionAnnotationState = (
  annotation: VisionAnnotation,
  id: number,
  modelId: string,
  show = true
): VisionAnnotationState => {
  return {
    ...annotation,
    id,
    modelId,
    show,
  };
};
