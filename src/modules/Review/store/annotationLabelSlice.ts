import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AnnotationCollection, Tool } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/Process/AnnotationDetectionJobUpdate';
import { v4 as uuidv4 } from 'uuid';
import { Region } from '@cognite/react-image-annotate';
import { Point } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import {
  AnnotationStatus,
  KeypointItem,
  KeypointVertex,
} from 'src/utils/AnnotationUtils';
import { ReactText } from 'react';
import { RootState } from 'src/store/rootReducer';

type KeyPointState = {
  id: string;
  caption: string;
  order: string;
  color: string;
  defaultPosition?: [number, number];
};
type KeypointCollectionState = {
  id: string;
  keypointIds: string[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
};

type State = {
  predefinedAnnotations: AnnotationCollection;
  collections: {
    byId: Record<string, KeypointCollectionState>;
    allIds: string[];
    selectedIds: string[];
  };
  lastCollectionId: string | undefined;
  lastCollectionName: string | undefined;
  lastShape: string | undefined;
  lastKeyPoint: string | undefined;
  currentTool: Tool;
  keypointMap: {
    byId: Record<string, KeyPointState>;
    allIds: string[];
    selectedIds: string[];
  };
  keepUnsavedRegion: boolean;
};

const initialState: State = {
  predefinedAnnotations: {
    predefinedKeypoints: [],
    predefinedShapes: [],
  },
  collections: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  keypointMap: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  lastCollectionId: undefined,
  lastCollectionName: undefined,
  lastShape: undefined,
  lastKeyPoint: undefined,
  currentTool: 'select',
  keepUnsavedRegion: false,
};

const annotationLabelSlice = createSlice({
  name: 'annotationLabelSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    selectCollection(state, action: PayloadAction<string>) {
      const collection = state.collections.byId[action.payload];
      const status = state.collections.selectedIds.includes(action.payload);
      if (status) {
        state.collections.selectedIds = state.collections.selectedIds.filter(
          (id) => id !== action.payload
        );
      } else if (collection) {
        state.collections.selectedIds = [action.payload];
      }
    },
    toggleCollectionVisibility(state, action: PayloadAction<string>) {
      const collection = state.collections.byId[action.payload];
      if (collection) {
        collection.show = !collection.show;
      }
    },
    setCollectionStatus(
      state,
      action: PayloadAction<{ id: string; status: AnnotationStatus }>
    ) {
      const collection = state.collections.byId[action.payload.id];
      if (collection) {
        collection.status = action.payload.status;
      }
    },
    keypointSelectStatusChange(state, action: PayloadAction<string>) {
      const keypoint = state.keypointMap.byId[action.payload];
      const status = state.keypointMap.selectedIds.includes(action.payload);
      if (status) {
        state.keypointMap.selectedIds = state.keypointMap.selectedIds.filter(
          (id) => id !== action.payload
        );
      } else if (keypoint) {
        state.keypointMap.selectedIds = [action.payload];
      }
    },
    setLastShape(state, action: PayloadAction<string>) {
      state.lastShape = action.payload;
    },
    setLastCollectionName(state, action: PayloadAction<string>) {
      state.lastCollectionName = action.payload;
    },
    setSelectedTool(state, action: PayloadAction<Tool>) {
      state.currentTool = action.payload;
    },
    onCreateKeyPoint: {
      reducer: (
        state,
        action: PayloadAction<{
          id: string;
          collectionName: string;
          orderNumber?: string;
          positionX: number;
          positionY: number;
        }>
      ) => {
        state.lastKeyPoint = action.payload.id;
        state.lastCollectionName = action.payload.collectionName;

        const predefinedKeypoint =
          state.predefinedAnnotations.predefinedKeypoints
            .find(
              (col) => col.collectionName === action.payload.collectionName
            )!
            .keypoints!.find(
              (kp) => kp.order === (action.payload.orderNumber || '1')
            );

        const keypoint = {
          ...predefinedKeypoint,
          id: action.payload.id.toString(),
          defaultPosition: [action.payload.positionX, action.payload.positionY],
        };

        if (!state.lastCollectionId) {
          const collectionId = `${action.payload.collectionName}-${uuidv4()}`;

          const collection = {
            id: collectionId,
            keypointIds: [],
            name: action.payload.collectionName,
            selected: true,
            status: AnnotationStatus.Verified,
            show: true,
          };

          state.collections.byId[collectionId] = collection;
          state.collections.allIds = Object.keys(state.collections.byId);
          state.lastCollectionId = collectionId;
          state.collections.selectedIds = [collectionId];
        }
        state.collections.byId[state.lastCollectionId].keypointIds.push(
          keypoint.id
        );
        state.keypointMap.byId[keypoint.id] = keypoint as KeyPointState;
        state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
      },
      prepare: (
        id: ReactText,
        collectionName: string,
        x: number,
        y: number,
        orderNumber?: string
      ) => {
        return {
          payload: {
            id: id.toString(),
            collectionName,
            positionX: x,
            positionY: y,
            orderNumber,
          },
        };
      },
    },

    onUpdateKeyPoint(state, action: PayloadAction<Region>) {
      const keypointItem = state.keypointMap.byId[action.payload.id];
      if (keypointItem) {
        keypointItem.defaultPosition = [
          (action.payload as Point).x,
          (action.payload as Point).y,
        ];
      }
    },
    deleteCollectionById(state, action: PayloadAction<string>) {
      deleteCollection(state, action.payload);
    },
    deleteCurrentCollection(state) {
      const currentCollectionId = state.lastCollectionId;
      if (currentCollectionId) {
        deleteCollection(state, currentCollectionId);
      }
    },
    removeLabels(state) {
      state.predefinedAnnotations = {
        predefinedKeypoints: [],
        predefinedShapes: [],
      };
    },
    setKeepUnsavedRegion(state, action: PayloadAction<boolean>) {
      state.keepUnsavedRegion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      state.collections.selectedIds = [];
      state.keypointMap.selectedIds = [];
    });
    // Matchers
    builder.addMatcher(
      isAnyOf(
        CreateAnnotations.fulfilled,
        AnnotationDetectionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled,
        RetrieveAnnotations.fulfilled
      ),
      (state, action) => {
        const annotations = action.payload;

        // HACK: only update states if annotations belong to one single file
        // to avoid costly state update if thunks are triggered by other pages than review page
        if (
          [...new Set(annotations.map((item) => item.annotatedResourceId))]
            .length > 1
        ) {
          return;
        }

        const keypointAnnotations = annotations.filter(
          (annotation) => annotation.data?.keypoint
        );

        keypointAnnotations.forEach((keypointAnnotation) => {
          const keypointIds: string[] = [];
          keypointAnnotation.region?.vertices.forEach((keypoint) => {
            keypointIds.push((keypoint as KeypointVertex).id);
            state.keypointMap.byId[(keypoint as KeypointVertex).id] = {
              ...(keypoint as KeypointVertex),
            };
            state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
          });

          const collection = {
            id: keypointAnnotation.id.toString(),
            keypointIds,
            name: keypointAnnotation.text,
            status: AnnotationStatus.Verified,
            show: true,
          };

          state.collections.byId[keypointAnnotation.id.toString()] = collection;
          state.collections.allIds = Object.keys(state.collections.byId);
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        PopulateAnnotationTemplates.fulfilled,
        SaveAnnotationTemplates.fulfilled
      ),
      (state, action) => {
        state.predefinedAnnotations = action.payload;
      }
    );
  },
});

export type { State as AnnotationLabelReducerState };
export { initialState as annotationLabelReducerInitialState };

export const {
  selectCollection,
  toggleCollectionVisibility,
  setCollectionStatus,
  keypointSelectStatusChange,
  setSelectedTool,
  setLastShape,
  setLastCollectionName,
  onCreateKeyPoint,
  onUpdateKeyPoint,
  deleteCollectionById,
  deleteCurrentCollection,
  removeLabels,
  setKeepUnsavedRegion,
} = annotationLabelSlice.actions;

export default annotationLabelSlice.reducer;

// selectors

export const nextKeypoint = createSelector(
  (state: State) => state.predefinedAnnotations.predefinedKeypoints,
  (state: State) => state.collections.byId,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.lastCollectionName,
  (state: State) => state.lastKeyPoint,
  (
    keyPointCollectionTemplates,
    allCollections,
    allKeypoints,
    lastCollectionName,
    lastKeyPointId
  ) => {
    const lastKeyPoint = lastKeyPointId ? allKeypoints[lastKeyPointId] : null;
    const template =
      keyPointCollectionTemplates.find(
        (tmp) => tmp.collectionName === lastCollectionName
      ) || keyPointCollectionTemplates[0];

    if (template && template.keypoints && template.keypoints.length) {
      let nextPoint;
      if (lastKeyPoint) {
        const lastKeypointIndex = template.keypoints.findIndex(
          (keyPoint) =>
            keyPoint.order === lastKeyPoint.order &&
            keyPoint.caption === lastKeyPoint.caption &&
            keyPoint.color === lastKeyPoint.color
        );
        const nextIndex = lastKeypointIndex >= 0 ? lastKeypointIndex + 1 : 0;
        if (nextIndex === template.keypoints.length) {
          // eslint-disable-next-line prefer-destructuring
          nextPoint = template.keypoints[0];
        } else {
          nextPoint = template.keypoints[nextIndex];
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        nextPoint = template.keypoints[0];
      }

      return nextPoint;
    }
    return null;
  }
);

export const nextShape = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotationLabelReducer.predefinedAnnotations.predefinedShapes,
  (state: RootState) => state.annotationLabelReducer.lastShape,
  (annotationSettingsNewLabel, predefinedShapes, lastShape) => {
    if (annotationSettingsNewLabel.text) {
      return annotationSettingsNewLabel.text;
    }
    if (lastShape) {
      return lastShape;
    }
    return predefinedShapes[0]?.shapeName || '';
  }
);

export const nextCollection = createSelector(
  (state: RootState) => state.reviewSlice.annotationSettings.createNew,
  (state: RootState) =>
    state.annotationLabelReducer.predefinedAnnotations.predefinedKeypoints,
  (state: RootState) => state.annotationLabelReducer.lastCollectionName,
  (
    annotationSettingsNewLabel,
    predefinedKeypointCollections,
    lastCollectionName
  ) => {
    let collection = predefinedKeypointCollections[0];
    if (annotationSettingsNewLabel.text || lastCollectionName) {
      const collectionLabel =
        annotationSettingsNewLabel.text || lastCollectionName;
      const template = predefinedKeypointCollections.find(
        (c) => c.collectionName === collectionLabel
      );
      if (template) {
        collection = template;
      }
    }
    return collection;
  }
);

export const currentCollection = createSelector(
  (state: State) => state.lastCollectionId,
  (state: State) => state.collections.byId,
  (state: State) => state.collections.selectedIds,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.keypointMap.selectedIds,
  (state: State) => state.predefinedAnnotations.predefinedKeypoints,
  (
    lastCollectionId,
    allCollections,
    selectedCollectionIds,
    allKeypoints,
    selectedKeypointIds,
    collectionTemplate
  ) => {
    if (lastCollectionId) {
      const collection = allCollections[lastCollectionId];
      const keypoints = collection.keypointIds.map(
        (id) =>
          ({
            ...allKeypoints[id],
            selected: selectedKeypointIds.includes(id),
          } as KeypointItem)
      );
      const predefinedKeypoints = collectionTemplate.find(
        (template) => template.collectionName === collection.name
      )?.keypoints as KeypointItem[];
      const remainingKeypoints = predefinedKeypoints?.filter(
        (point) => !keypoints.some((k) => k.caption === point.caption)
      );

      return {
        ...collection,
        selected: selectedCollectionIds.includes(collection.id),
        keypoints,
        remainingKeypoints,
      };
    }
    return null;
  }
);

export const keypointsCompleteInCollection = createSelector(
  (state: State) => state.lastCollectionId,
  (state: State) => state.collections.byId,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.predefinedAnnotations.predefinedKeypoints,
  (lastCollectionId, allCollections, allKeyPoints, collectionTemplate) => {
    if (lastCollectionId) {
      const collection = allCollections[lastCollectionId];
      const predefinedCollection = collectionTemplate.find(
        (template) => template.collectionName === collection.name
      );
      const templateKeypoints = predefinedCollection!.keypoints;
      const createdKeyPointOrderNumbers = collection.keypointIds.map(
        (id) => allKeyPoints[id].order
      );
      const completedKeypoints = templateKeypoints!.filter((kpoint) =>
        createdKeyPointOrderNumbers.includes(kpoint.order)
      );
      return [completedKeypoints.length, templateKeypoints?.length];
    }
    return null;
  }
);

// state utils

const deleteCollection = (state: State, collectionId: string) => {
  const collection = state.collections.byId[collectionId];
  if (collection) {
    delete state.collections.byId[collection.id];
    state.collections.allIds = Object.keys(state.collections.byId);

    if (collection.keypointIds.length) {
      collection.keypointIds.forEach((id) => delete state.keypointMap.byId[id]);
      state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
    }
  }
  if (state.lastCollectionId === collectionId) {
    state.lastCollectionId = undefined;
  }
};
