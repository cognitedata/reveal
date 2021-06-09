import {
  createAction,
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AnnotationBoundingBox,
  AnnotationDrawerMode,
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
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/AnnotationDetectionJobUpdate';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { UpdateAnnotationsById } from 'src/store/thunks/UpdateAnnotationsById';
import { AddAnnotationsFromEditModeAssetIds } from 'src/store/thunks/AddAnnotationsFromEditModeAssetIds';

export interface VisionAnnotationState extends Omit<VisionAnnotation, 'id'> {
  id: number;
  modelId: string;
  color: string;
  show: boolean;
}

export interface VisibleAnnotations extends VisionAnnotationState {
  box: AnnotationBoundingBox;
  show: true;
  selected?: false;
}

export interface VisionModelState {
  modelId: string;
  fileId: number;
  modelType: VisionAPIType;
  annotations: number[];
}

type State = {
  drawer: {
    show: boolean;
    mode: number | null;
    text: string;
    box: AnnotationBoundingBox | null;
    selectedAssetIds: number[];
  };
  selectedAnnotations: {
    asset: number[];
    other: number[];
  };
  imagePreview: {
    editable: number;
  };
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
  selectedAnnotations: {
    asset: [],
    other: [],
  },
  drawer: {
    show: false,
    mode: null,
    text: '',
    box: null,
    selectedAssetIds: [],
  },
  imagePreview: {
    editable: ImagePreviewEditMode.NotEditable,
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

// Actions
type LabelEdit = {
  label: string;
};
type PolygonEdit = {
  box: AnnotationBoundingBox;
  modelType: VisionAPIType;
};
export const editLabelAddAnnotation = createAction<LabelEdit>(
  'editLabelAddAnnotation'
);
export const addPolygon = createAction<PolygonEdit>('addPolygon');

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
    selectAnnotation(
      state,
      action: PayloadAction<{ id: number; asset: boolean }>
    ) {
      const annId = action.payload.id;
      if (action.payload.asset) {
        if (!state.selectedAnnotations.asset.includes(annId)) {
          state.selectedAnnotations.asset.push(annId);
        }
      } else if (!state.selectedAnnotations.other.includes(annId)) {
        state.selectedAnnotations.other.push(annId);
      }
    },
    deselectAnnotation(
      state,
      action: PayloadAction<{ id: number; asset: boolean }>
    ) {
      const annId = action.payload.id;
      if (action.payload.asset) {
        const assetAnnotationIdIndex =
          state.selectedAnnotations.asset.findIndex((item) => item === annId);
        if (assetAnnotationIdIndex >= 0) {
          state.selectedAnnotations.asset.splice(assetAnnotationIdIndex, 1);
        }
      } else {
        const otherAnnotationIdIndex =
          state.selectedAnnotations.other.findIndex((item) => item === annId);
        if (otherAnnotationIdIndex >= 0) {
          state.selectedAnnotations.other.splice(otherAnnotationIdIndex, 1);
        }
      }
    },
    showAnnotationDrawer(state, action: PayloadAction<AnnotationDrawerMode>) {
      state.drawer.show = false;
      state.drawer.mode = action.payload;
      state.imagePreview.editable = ImagePreviewEditMode.NotEditable; // disable any existing edit mode
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
    updateAnnotationBoundingBox(
      state,
      action: PayloadAction<{ id: number; boundingBox: AnnotationBoundingBox }>
    ) {
      const annotation = state.annotations.byId[action.payload.id];
      annotation.box = action.payload.boundingBox;
    },
    annotationApproval: {
      prepare: (id: number, status: AnnotationStatus) => {
        return { payload: { annotationId: id, status } };
      },
      reducer: (
        state,
        action: PayloadAction<{
          annotationId: number;
          status: AnnotationStatus;
        }>
      ) => {
        const { status, annotationId } = action.payload;
        const annotation = state.annotations.byId[annotationId];

        annotation.status = status;
      },
    },
    selectAssetsIds(state, action: PayloadAction<number[]>) {
      state.drawer.selectedAssetIds = action.payload;
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
    resetEditState(state) {
      state.drawer.text = '';
      state.drawer.box = null;
      state.drawer.selectedAssetIds = [];
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

    builder.addCase(SaveAvailableAnnotations.fulfilled, (state) => {
      resetPreviewState(state);
      state.annotations = initialState.annotations;
      state.models = initialState.models;
      state.modelsByFileId = initialState.modelsByFileId;
    });

    // Matchers

    const isLabelEdit = (
      action: PayloadAction<LabelEdit> | PayloadAction<PolygonEdit>
    ): action is PayloadAction<LabelEdit> => {
      return 'label' in (action as PayloadAction<LabelEdit>).payload;
    };

    builder.addMatcher(
      isAnyOf(
        addAnnotations,
        CreateAnnotations.fulfilled,
        AnnotationDetectionJobUpdate.fulfilled,
        UpdateAnnotationsById.fulfilled
      ),
      (state, action) => {
        addEditAnnotationsToState(state, action.payload);
      }
    );

    builder.addMatcher(
      isAnyOf(editLabelAddAnnotation, addPolygon),
      (state, action) => {
        if (isLabelEdit(action)) {
          state.drawer.text = action.payload.label;
        } else {
          state.drawer.box = action.payload.box;
        }
      }
    );

    builder.addMatcher(
      isAnyOf(
        CreateAnnotations.fulfilled,
        AddAnnotationsFromEditModeAssetIds.fulfilled
      ),
      (state) => {
        resetDrawerEditState(state);
      }
    );
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
  updateAnnotationBoundingBox,
  annotationApproval,
  selectAssetsIds,
  addTagAnnotations,
  resetEditState,
  resetPreview,
} = previewSlice.actions;

// state helper functions

const resetPreviewState = (state: State) => {
  resetDrawerEditState(state);
  state.selectedAnnotations = { asset: [], other: [] };
};

const resetDrawerEditState = (state: State) => {
  state.drawer = {
    show: false,
    mode: state.drawer.mode,
    text: state.drawer.text, // Keep the state for sequencial labeling
    box: null,
    selectedAssetIds: [],
  };
  state.imagePreview = {
    editable: state.imagePreview.editable,
  };
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
        ...createVisionAnnotationState(item, id, modelId, true),
        ...annotation,
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
  state.selectedAnnotations.asset = state.selectedAnnotations.asset.filter(
    (id) => !annotationIds.includes(id)
  );
  state.selectedAnnotations.other = state.selectedAnnotations.other.filter(
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

export const selectEditModeAnnotations = (state: State, fileId: string) =>
  state.drawer.box
    ? [
        AnnotationUtils.createVisionAnnotationStub(
          0,
          state.drawer.text,
          state.drawer.mode === AnnotationDrawerMode.AddAnnotation
            ? VisionAPIType.ObjectDetection
            : VisionAPIType.TagDetection,
          parseInt(fileId, 10),
          0,
          0,
          state.drawer.box,
          'rectangle',
          'user',
          AnnotationStatus.Verified
        ),
      ]
    : [];

export const selectVisibleNonRejectAndEditModeAnnotations = createSelector(
  selectVisibleNonRejectedAnnotationsByFileId,
  selectEditModeAnnotations,
  (VisibleNonRejectedAnnotations, editModeAnnotations) => {
    return VisibleNonRejectedAnnotations.concat(
      editModeAnnotations as VisionAnnotationState[]
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
