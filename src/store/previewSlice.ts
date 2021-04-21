import {
  createAction,
  createSelector,
  createSlice,
  isAnyOf,
  isFulfilled,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AnnotationBoundingBox,
  AnnotationDrawerMode,
  AnnotationStatus,
  AnnotationUtils,
  ModelTypeAnnotationTypeMap,
  ModelTypeSourceMap,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { AnnotationType, VisionAPIType } from 'src/api/types';
import {
  addAnnotations,
  deleteAnnotationsFromState,
  fileProcessUpdate,
} from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import {
  AnnotationCounts,
  AnnotationsBadgeProps,
} from 'src/pages/Workflow/types';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';

export interface VisionAnnotationState extends Omit<VisionAnnotation, 'id'> {
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
  modelType: VisionAPIType;
  annotations: string[];
}

type State = {
  drawer: {
    show: boolean;
    mode: number | null;
    annotation: Partial<VisionAnnotationState> | null;
    selectedAssetIds: number[];
  };
  selectedAnnotations: {
    asset: string[];
    other: string[];
  };
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
  selectedAnnotations: {
    asset: [],
    other: [],
  },
  drawer: {
    show: false,
    mode: null,
    annotation: null,
    selectedAssetIds: [],
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

// Actions
type LabelEdit = {
  fileId: string;
  label: string;
};
type PolygonEdit = {
  fileId: string;
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
        annotationId: string;
      }>
    ) {
      const id = action.payload.annotationId;
      const visibility = state.annotations.byId[id].show;
      state.annotations.byId[id].show = !visibility;
    },
    selectAnnotation(
      state,
      action: PayloadAction<{ id: string; asset: boolean }>
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
      action: PayloadAction<{ id: string; asset: boolean }>
    ) {
      const annId = action.payload.id;
      if (action.payload.asset) {
        const assetAnnotationIdIndex = state.selectedAnnotations.asset.findIndex(
          (item) => item === annId
        );
        if (assetAnnotationIdIndex >= 0) {
          state.selectedAnnotations.asset.splice(assetAnnotationIdIndex, 1);
        }
      } else {
        const otherAnnotationIdIndex = state.selectedAnnotations.other.findIndex(
          (item) => item === annId
        );
        if (otherAnnotationIdIndex >= 0) {
          state.selectedAnnotations.other.splice(otherAnnotationIdIndex, 1);
        }
      }
    },
    showAnnotationDrawer(state, action: PayloadAction<AnnotationDrawerMode>) {
      state.drawer.show = true;
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
    createAnnotation(
      state,
      action: PayloadAction<{ fileId: string; type: AnnotationDrawerMode }>
    ) {
      if (action.payload.type === AnnotationDrawerMode.AddAnnotation) {
        const editModeAnnotationData = state.drawer.annotation;

        if (editModeAnnotationData && editModeAnnotationData.text) {
          addEditAnnotationsToState(state, [
            editModeAnnotationData as VisionAnnotation,
          ]);
          state.drawer.annotation = null;
        }
      }
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
      state.drawer.annotation = null;
      state.drawer.selectedAssetIds = [];
    },
    resetPreview(state) {
      resetPreviewState(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addAnnotations, (state, { payload }) => {
      addEditAnnotationsToState(state, payload);
    });

    builder.addCase(deleteAnnotationsFromState, (state, { payload }) => {
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
      const { job } = payload;

      if (job.status === 'Completed') {
        job.items.forEach((fileAnn) => {
          const { annotations } = fileAnn;

          const visionAnnotations = annotations.map((ann) =>
            AnnotationUtils.createVisionAnnotationStub(
              ann.text,
              job.type,
              fileAnn.fileId,
              {
                xMin: ann.region.vertices[0].x,
                yMin: ann.region.vertices[0].y,
                xMax: ann.region.vertices[1].x,
                yMax: ann.region.vertices[1].y,
              },
              undefined,
              ModelTypeSourceMap[job.type],
              undefined,
              undefined,
              ModelTypeAnnotationTypeMap[job.type] as AnnotationType
            )
          );
          addEditAnnotationsToState(state, visionAnnotations);
        });
      }
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
      isAnyOf(editLabelAddAnnotation, addPolygon),
      (state, action) => {
        if (state.drawer.annotation === null) {
          state.drawer.annotation = AnnotationUtils.createVisionAnnotationStub(
            '',
            isLabelEdit(action)
              ? VisionAPIType.ObjectDetection // TODO: Why is this needed?
              : action.payload.modelType,
            parseInt(action.payload.fileId, 10),
            undefined,
            'rectangle',
            'user',
            AnnotationStatus.Verified
          );
        }
        if (isLabelEdit(action)) {
          state.drawer.annotation.text = action.payload.label;
        } else {
          state.drawer.annotation.box = action.payload.box;
        }
      }
    );

    builder.addMatcher(isFulfilled(SaveAnnotations, DeleteAnnotations), (_) => {
      ToastUtils.onSuccess('Annotations Updated!');
    });

    builder.addMatcher(
      isRejected(SaveAnnotations, RetrieveAnnotations, DeleteAnnotations),
      (_, { error }) => {
        if (error && error.message) {
          ToastUtils.onFailure(
            `Failed to update Annotations! ${error?.message}`
          );
        }
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
  createAnnotation,
  selectAssetsIds,
  addTagAnnotations,
  resetEditState,
  resetPreview,
} = previewSlice.actions;

// state helper functions

const resetPreviewState = (state: State) => {
  state.drawer = {
    show: false,
    mode: null,
    annotation: null,
    selectedAssetIds: [],
  };
  state.imagePreview = {
    editable: 0,
    createdBoundingBoxes: {},
    modifiedBoundingBoxes: {},
  };
  state.selectedAnnotations = { asset: [], other: [] };
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
    const fileId = String(item.annotatedResourceId);

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

    // update annotations
    const generatedId = AnnotationUtils.generateAnnotationId(
      String(item.annotatedResourceId),
      item.annotationType,
      state.annotations.counter++
    );
    const id = item.id || generatedId;

    const annotation = state.annotations.byId[id];
    if (annotation) {
      state.annotations.byId[id] = {
        ...createVisionAnnotationState(item, id, modelId, true),
        ...annotation,
      };
    } else {
      if (state.models.byId[modelId].annotations.includes(id)) {
        // todo: remove this check after development complete
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
  (_, fileId: string, modelType: VisionAPIType) => modelType,
  (allAnnotations, models, modelType) => {
    const modelId = models.find((item) => item.modelType === modelType)
      ?.modelId;

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

export const selectEditModeAnnotations = (state: State) =>
  state.drawer.annotation?.box ? [state.drawer.annotation] : [];

export const selectVisibleNonRejectAndEditModeAnnotations = createSelector(
  selectVisibleNonRejectedAnnotationsByFileId,
  selectEditModeAnnotations,
  (VisibleNonRejectedAnnotations, editModeAnnotations) => {
    return VisibleNonRejectedAnnotations.concat(
      editModeAnnotations as VisionAnnotationState[]
    );
  }
);

export const selectModelAnnotationCountsByFileId = createSelector(
  annotationsById,
  selectModelsByFileId,
  (allAnnotations, modelsByFile) => {
    const annotationBadgeProps: AnnotationsBadgeProps = {
      tag: {},
      gdpr: {},
      text: {},
      objects: {},
    };
    modelsByFile.forEach((model) => {
      const annotations: VisionAnnotationState[] = model.annotations.map(
        (annId) => allAnnotations[annId]
      );

      if (model.modelType === VisionAPIType.OCR) {
        annotationBadgeProps.text = generateAnnotationCount(annotations);
      }
      if (model.modelType === VisionAPIType.TagDetection) {
        annotationBadgeProps.tag = generateAnnotationCount(annotations);
      }

      if (model.modelType === VisionAPIType.ObjectDetection) {
        const objectNonGDPRAnnotations: VisionAnnotationState[] =
          annotations.filter((ann) => ann.label !== 'person') || [];
        const objectGDPRAnnotations: VisionAnnotationState[] =
          annotations.filter((ann) => ann.label === 'person') || [];
        annotationBadgeProps.objects = generateAnnotationCount(
          objectNonGDPRAnnotations
        );
        annotationBadgeProps.gdpr = generateAnnotationCount(
          objectGDPRAnnotations
        );
      }
    });
    return annotationBadgeProps;
  }
);

const createVisionAnnotationState = (
  annotation: VisionAnnotation,
  id: string,
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

const generateAnnotationCount = (annotations: VisionAnnotationState[]) => {
  let [modelGenerated, manuallyGenerated, verified, unhandled, rejected] = [
    0,
    0,
    0,
    0,
    0,
  ];

  annotations.forEach((ann) => {
    if (ann.source === 'user') {
      manuallyGenerated++;
    } else {
      modelGenerated++;
    }
    if (ann.status === AnnotationStatus.Verified) {
      verified++;
    }
    if (ann.status === AnnotationStatus.Unhandled) {
      unhandled++;
    }
    if (ann.status === AnnotationStatus.Rejected) {
      rejected++;
    }
  });

  return {
    modelGenerated,
    manuallyGenerated,
    verified,
    unhandled,
    rejected,
  } as AnnotationCounts;
};
