import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { Tool } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { Region } from '@cognite/react-image-annotate';
import { Point } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import {
  AnnotationStatus,
  createUniqueId,
  KeypointVertex,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { ReactText } from 'react';
import { AnnotationLabelState, KeyPointState } from './types';
import { deleteCollection } from './utils';

export const initialState: AnnotationLabelState = {
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
        const predefinedCollection =
          state.predefinedAnnotations.predefinedKeypoints.find(
            (col) => col.collectionName === action.payload.collectionName
          );

        if (predefinedCollection) {
          state.lastKeyPoint = action.payload.id;
          state.lastCollectionName = action.payload.collectionName;

          const predefinedKeypoint = predefinedCollection?.keypoints!.find(
            (kp) => kp.order === (action.payload.orderNumber || '1')
          );

          const keypoint = {
            ...predefinedKeypoint,
            id: action.payload.id.toString(),
            defaultPosition: [
              action.payload.positionX,
              action.payload.positionY,
            ],
          };

          if (!state.lastCollectionId) {
            const collectionId = createUniqueId(action.payload.collectionName);

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
        }
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
        VisionJobUpdate.fulfilled,
        UpdateAnnotationsV1.fulfilled,
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

export type { AnnotationLabelState as AnnotationLabelReducerState };

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
