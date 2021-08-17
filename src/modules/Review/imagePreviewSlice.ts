import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AnnotationCollection } from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsTypes';
import { v4 as uuidv4 } from 'uuid';
import { Region } from '@cognite/react-image-annotate';
import { Point } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import {
  AnnotationStatus,
  KeypointItem,
  KeypointVertex,
} from 'src/utils/AnnotationUtils';
import { addAnnotations } from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/AnnotationDetectionJobUpdate';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';

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
  predefinedCollections: AnnotationCollection;
  collections: {
    byId: Record<string, KeypointCollectionState>;
    allIds: string[];
    selectedIds: string[];
  };
  lastCollection: string | undefined;
  lastShape: string | undefined;
  lastKeyPoint: string | undefined;
  keypointMap: {
    byId: Record<string, KeyPointState>;
    allIds: string[];
    selectedIds: string[];
  };
};

export const initialState: State = {
  predefinedCollections: {
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
  lastCollection: undefined,
  lastShape: undefined,
  lastKeyPoint: undefined,
};

const imagePreviewSlice = createSlice({
  name: 'previewSlice',
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
    deSelectAllCollections(state) {
      state.collections.selectedIds = [];
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
    deselectAllKeypoints(state) {
      state.keypointMap.selectedIds = [];
    },
    setCollectionSettings(state, action: PayloadAction<AnnotationCollection>) {
      state.predefinedCollections.predefinedKeypoints =
        action.payload.predefinedKeypoints;
      state.predefinedCollections.predefinedShapes =
        action.payload.predefinedShapes;
    },
    onCreateOrUpdateShape(state, action: PayloadAction<string>) {
      state.lastShape = action.payload;
    },
    onCreateKeyPoint: {
      reducer: (
        state,
        action: PayloadAction<{
          region: Region;
          collectionName: string;
          orderNumber: string;
        }>
      ) => {
        state.lastKeyPoint = action.payload.region.id.toString();

        const predefinedKeypoint =
          state.predefinedCollections.predefinedKeypoints
            .find(
              (col) => col.collectionName === action.payload.collectionName
            )!
            .keypoints!.find((kp) => kp.order === action.payload.orderNumber);

        const keypoint = {
          ...predefinedKeypoint,
          id: action.payload.region.id.toString(),
          defaultPosition: [
            (action.payload.region as Point).x,
            (action.payload.region as Point).y,
          ],
        };

        if (!state.lastCollection) {
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
          state.lastCollection = collectionId;
          state.collections.selectedIds = [collectionId];
        }
        state.collections.byId[state.lastCollection].keypointIds.push(
          keypoint.id
        );
        state.keypointMap.byId[keypoint.id] = keypoint as KeyPointState;
        state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
      },
      prepare: (
        region: Region,
        collectionName: string,
        orderNumber: string
      ) => {
        return { payload: { region, collectionName, orderNumber } };
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
      const currentCollectionId = state.lastCollection;
      if (currentCollectionId) {
        deleteCollection(state, currentCollectionId);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        addAnnotations,
        CreateAnnotations.fulfilled,
        AnnotationDetectionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled,
        RetrieveAnnotations.fulfilled
      ),
      (state, action) => {
        const annotations = action.payload;

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
  },
});
export const {
  selectCollection,
  deSelectAllCollections,
  toggleCollectionVisibility,
  setCollectionStatus,
  keypointSelectStatusChange,
  deselectAllKeypoints,
  setCollectionSettings,
  onCreateOrUpdateShape,
  onCreateKeyPoint,
  onUpdateKeyPoint,
  deleteCollectionById,
  deleteCurrentCollection,
} = imagePreviewSlice.actions;

export default imagePreviewSlice.reducer;

// selectors

export const nextKeyPoint = createSelector(
  (state: State) => state.predefinedCollections.predefinedKeypoints,
  (state: State) => state.collections.byId,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.lastCollection,
  (state: State) => state.lastKeyPoint,
  (
    keyPointCollectionTemplates,
    allCollections,
    allKeypoints,
    lastCollectionId,
    lastKeyPointId
  ) => {
    const lastCollection = lastCollectionId
      ? allCollections[lastCollectionId]
      : null;
    const lastKeyPoint = lastKeyPointId ? allKeypoints[lastKeyPointId] : null;
    const template =
      keyPointCollectionTemplates.find(
        (tmp) => tmp.collectionName === lastCollection?.name
      ) || keyPointCollectionTemplates[0];

    if (template && template.keypoints && template.keypoints.length) {
      let nextPoint;
      if (lastKeyPoint) {
        const lastKeypointIndex = template.keypoints.findIndex(
          (keyPoint) => keyPoint.order === lastKeyPoint.order
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

      if (nextPoint) {
        return {
          collectionName: template.collectionName,
          orderNumber: parseInt(nextPoint.order, 10),
        };
      }
    }

    if (template) {
      return {
        collectionName: template.collectionName,
        orderNumber: Math.min(
          ...(template.keypoints?.map((keyPoint) =>
            parseInt(keyPoint.order, 10)
          ) || [])
        ),
      };
    }
    return { collectionName: '', orderNumber: 0 };
  }
);

export const nextShape = createSelector(
  (state: State) => state.predefinedCollections.predefinedShapes,
  (state: State) => state.lastShape,
  (predefinedShapes, lastShape) => {
    if (lastShape) {
      return lastShape;
    }
    return predefinedShapes[0]?.ShapeName || '';
  }
);

export const currentCollection = createSelector(
  (state: State) => state.lastCollection,
  (state: State) => state.collections.byId,
  (state: State) => state.collections.selectedIds,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.keypointMap.selectedIds,
  (
    lastCollection,
    allCollections,
    selectedCollectionIds,
    allKeypoints,
    selectedKeypointIds
  ) => {
    if (lastCollection) {
      const collection = allCollections[lastCollection];
      const keypoints = collection.keypointIds.map(
        (id) =>
          ({
            ...allKeypoints[id],
            selected: selectedKeypointIds.includes(id),
          } as KeypointItem)
      );
      return {
        ...collection,
        selected: selectedCollectionIds.includes(collection.id),
        keypoints,
      };
    }
    return null;
  }
);

export const keypointsCompleteInCollection = createSelector(
  (state: State) => state.lastCollection,
  (state: State) => state.collections.byId,
  (state: State) => state.keypointMap.byId,
  (state: State) => state.predefinedCollections.predefinedKeypoints,
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
  if (state.lastCollection === collectionId) {
    state.lastCollection = undefined;
  }
};
