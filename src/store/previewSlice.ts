import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AnnotationBoundingBox,
  AnnotationDrawerMode,
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import {
  addAnnotations,
  deleteAnnotations,
  fileProcessUpdate,
} from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';

export interface VisionAnnotationState extends VisionAnnotation {
  id: string;
  modelId: string;
  color: string;
  show: boolean;
}

export interface VisibleAnnotations extends VisionAnnotationState {
  box: AnnotationBoundingBox;
  show: true;
}

export interface VisionModelState {
  modelId: string;
  fileId: string;
  modelType: DetectionModelType;
  annotations: string[];
}

type State = {
  drawer: {
    show: boolean;
    mode: number | null;
  };
  selectedAnnotations: string[];
  imagePreview: {
    editable: number;
    createdBoundingBoxes: {};
    modifiedBoundingBoxes: {};
  };
  annotations: {
    counter: number;
    byId: Record<string, VisionAnnotationState>;
    allIds: string[];
  };
  models: {
    byId: Record<string, VisionModelState>;
    allIds: string[];
  };
  modelsByFileId: Record<string, string[]>;
};

const initialState: State = {
  selectedAnnotations: [],
  drawer: {
    show: false,
    mode: null,
  },
  imagePreview: {
    editable: ImagePreviewEditMode.NotEditable,
    createdBoundingBoxes: {},
    modifiedBoundingBoxes: {},
  },
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
        annotationId: string;
      }>
    ) {
      const id = action.payload.annotationId;
      const visibility = state.annotations.byId[id].show;
      state.annotations.byId[id].show = !visibility;
    },
    selectAnnotation(state, action: PayloadAction<string>) {
      if (!state.selectedAnnotations.includes(action.payload)) {
        state.selectedAnnotations.push(action.payload);
      }
    },
    deselectAnnotation(state, action: PayloadAction<string>) {
      const annotationIdIndex = state.selectedAnnotations.findIndex(
        (item) => item === action.payload
      );
      if (annotationIdIndex >= 0) {
        state.selectedAnnotations.splice(annotationIdIndex, 1);
      }
    },
    showAnnotationDrawer(state, action: PayloadAction<AnnotationDrawerMode>) {
      state.drawer.show = true;
      state.drawer.mode = action.payload;
    },
    closeAnnotationDrawer(state) {
      state.drawer.show = false;
    },
    setImagePreviewEditState(
      state,
      action: PayloadAction<ImagePreviewEditMode>
    ) {
      state.imagePreview.editable = action.payload;
    },
    updateAnnotation(
      state,
      action: PayloadAction<{ id: string; boundingBox: AnnotationBoundingBox }>
    ) {
      const annotation = state.annotations.byId[action.payload.id];
      annotation.box = action.payload.boundingBox;
    },
    annotationApproval: {
      prepare: (id: string, status: AnnotationStatus) => {
        return { payload: { annotationId: id, status } };
      },
      reducer: (
        state,
        action: PayloadAction<{
          annotationId: string;
          status: AnnotationStatus;
        }>
      ) => {
        const { status, annotationId } = action.payload;
        const annotation = state.annotations.byId[annotationId];

        annotation.status = status;
      },
    },
    resetPreview(state) {
      resetPreviewState(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addAnnotations, (state, { payload }) => {
      const { annotations, fileId, type, status } = payload;

      addAnnotationsToState(state, annotations, fileId, type, status);
    });

    builder.addCase(deleteAnnotations, (state, { payload }) => {
      deleteAnnotationsByIds(state, payload);
    });
    // On Delete File //

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        const models = state.modelsByFileId[fileId.id];

        models.forEach((modelId) => {
          const modelState = state.models.byId[modelId];
          const { annotations } = modelState;

          annotations.forEach((annotationId) => {
            delete state.annotations.byId[annotationId];
          });
          state.annotations.allIds = Object.keys(state.annotations.byId);

          delete state.models.byId[modelId];
        });
        state.models.allIds = Object.keys(state.models.byId);

        delete state.modelsByFileId[fileId.id];
      });
    });

    // On Job Update //

    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { job, fileId } = payload;

      if (job.status === 'Completed') {
        const { annotations } = job.items[0];
        const visionAnnotations = AnnotationUtils.convertToAnnotations(
          annotations,
          job.type
        );

        addAnnotationsToState(
          state,
          visionAnnotations,
          fileId.toString(),
          job.type,
          AnnotationStatus.Unhandled
        );
      }
    });
  },
});

export default previewSlice.reducer;
export const {
  toggleAnnotationVisibility,
  selectAnnotation,
  deselectAnnotation,
  showAnnotationDrawer,
  closeAnnotationDrawer,
  setImagePreviewEditState,
  updateAnnotation,
  annotationApproval,
  resetPreview,
} = previewSlice.actions;

// state helper functions

const resetPreviewState = (state: State) => {
  state.drawer = {
    show: false,
    mode: null,
  };
  state.imagePreview = {
    editable: 0,
    createdBoundingBoxes: {},
    modifiedBoundingBoxes: {},
  };
  state.selectedAnnotations = [];
};

export const addAnnotationsToState = (
  state: State,
  annotations: VisionAnnotation[],
  fileId: string,
  type: DetectionModelType,
  status: AnnotationStatus
) => {
  const modelId = AnnotationUtils.getModelId(String(fileId), type);

  // update models
  if (!state.models.byId[modelId]) {
    state.models.byId[modelId] = {
      modelId,
      modelType: type,
      fileId,
      annotations: [],
    };

    state.models.allIds = Object.keys(state.models.byId);
  }

  // update file models
  const fileModels = state.modelsByFileId[fileId];
  if (!fileModels) {
    state.modelsByFileId[fileId] = [modelId];
  } else if (fileModels && !fileModels.includes(modelId)) {
    fileModels.push(modelId);
  }

  // update annotations

  annotations.forEach((item) => {
    const id = AnnotationUtils.generateAnnotationId(
      String(fileId),
      type,
      state.annotations.counter++
    );
    state.models.byId[modelId].annotations.push(id);
    state.annotations.byId[id] = {
      id,
      ...item,
      modelId,
      show: true,
      status,
    };
  });

  state.annotations.allIds = Object.keys(state.annotations.byId);
};

const deleteAnnotationsByIds = (state: State, annotationIds: string[]) => {
  annotationIds.forEach((annId) => {
    const annotation = state.annotations.byId[annId];
    const model = state.models.byId[annotation.modelId];
    model.annotations = model.annotations.filter(
      (item) => item !== annotation.id
    );
    delete state.annotations.byId[annotation.id];
    state.annotations.allIds = Object.keys(state.annotations.byId);
  });
};

// selectors

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

export const selectAnnotationsByFileIdModelType = createSelector(
  selectAnnotationsByFileId,
  selectModelsByFileId,
  (_, fileId: string, modelType: DetectionModelType) => modelType,
  (allAnnotations, models, modelType) => {
    const modelId = models.find((item) => item.modelType === modelType)
      ?.modelId;

    if (modelId) {
      return allAnnotations.filter((item) => item.modelId === modelId);
    }
    return [];
  }
);

export const selectNonRejectedAnnotationsByFileIdModelType = createSelector(
  selectAnnotationsByFileIdModelType,
  (annotationIdsByFileAndModelType) => {
    return annotationIdsByFileAndModelType.filter(
      (item) => item.status !== AnnotationStatus.Rejected
    );
  }
);

export const selectVisibleAnnotationsByFileId = createSelector(
  selectAnnotationsByFileId,
  (annotationIdsByFile) => {
    return annotationIdsByFile.filter((item) => !!item.box && item.show);
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
