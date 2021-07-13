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
  deleteAnnotationsFromState,
} from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/AnnotationDetectionJobUpdate';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';

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
};

const initialState: State = {
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
};

const previewSlice = createSlice({
  name: 'previewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
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
    resetPreview(state) {
      resetPreviewState(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteAnnotationsFromState, (state, { payload }) => {
      deleteAnnotationsByIds(state, payload);
    });
    // On Delete File //

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        const models = state.modelsByFileId[fileId.id];
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

        delete state.modelsByFileId[fileId.id];
      });
    });

    // Matchers

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
  toggleAnnotationVisibility,
  selectAnnotation,
  deselectAllAnnotations,
  addTagAnnotations,
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

export const selectModelIdsByFileId = (
  state: State,
  fileId: string
): string[] => {
  const models = state.modelsByFileId[fileId] || [];
  return models;
};

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

export const selectAnnotationsByFileIdModelTypes = createSelector(
  selectAnnotationsByFileId,
  selectModelsByFileId,
  (state: State, fileId: string, modelTypes: VisionAPIType[]) => modelTypes,
  (annotationByFileId, modelsByFileId, modelTypes) => {
    const modelIds = modelsByFileId
      .filter((item) => modelTypes.includes(item.modelType))
      .map((model) => model.modelId);

    if (modelIds && modelIds.length) {
      return annotationByFileId.filter((item) =>
        modelIds.includes(item.modelId)
      );
    }
    return [];
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
