import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { Tool } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import {
  AnnotationStatus,
  createUniqueId,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { ReactText } from 'react';
import { deleteCollection } from 'src/modules/Review/store/annotatorWrapper/utils';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { ReviewImageKeypoint } from 'src/modules/Review/store/review/types';
import { convertCDFAnnotationV1ToVisionAnnotations } from 'src/api/annotation/bulkConverters';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { ImageKeypointCollection } from 'src/api/annotation/types';
import { isImageKeypointCollectionData } from 'src/modules/Common/types/typeGuards';

export const initialState: AnnotatorWrapperState = {
  predefinedAnnotations: {
    predefinedKeypointCollections: [],
    predefinedShapes: [],
  },
  keypointMap: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  collections: {
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

const annotatorWrapperSlice = createSlice({
  name: 'annotatorWrapperSlice',
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
          positionX: number;
          positionY: number;
          orderNumber?: number;
          // confidence?
        }>
      ) => {
        const predefinedKeypointCollection =
          state.predefinedAnnotations.predefinedKeypointCollections.find(
            (collection) =>
              collection.collectionName === action.payload.collectionName
          );

        if (predefinedKeypointCollection) {
          state.lastKeyPoint = action.payload.id;
          state.lastCollectionName = action.payload.collectionName;

          const predefinedKeypoint =
            predefinedKeypointCollection.keypoints![
              action.payload.orderNumber || 0
            ];

          const reviewKeypoint: ReviewImageKeypoint = {
            id: action.payload.id.toString(),
            selected: true, // select the keypoint after creating
            keypoint: {
              label: predefinedKeypoint.caption,
              point: {
                x: action.payload.positionX,
                y: action.payload.positionY,
              },
            },
          };

          if (!state.lastCollectionId) {
            const collectionId = createUniqueId(action.payload.collectionName);

            const collection = {
              id: collectionId,
              keypointIds: [],
              label: action.payload.collectionName,
              status: AnnotationStatus.Verified,
              show: true,
            };

            state.collections.byId[collectionId] = collection;
            state.collections.allIds = Object.keys(state.collections.byId);
            state.lastCollectionId = collectionId;
            state.collections.selectedIds = [collectionId];
          }
          state.collections.byId[state.lastCollectionId].keypointIds.push(
            reviewKeypoint.id
          );
          state.keypointMap.byId[reviewKeypoint.id] = reviewKeypoint;
          state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
        }
      },
      prepare: (
        id: ReactText,
        collectionName: string,
        x: number,
        y: number,
        orderNumber?: number
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

    onUpdateKeyPoint(state, action: PayloadAction<ReviewImageKeypoint>) {
      state.keypointMap.byId[action.payload.id] = action.payload;
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
        predefinedKeypointCollections: [],
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
        UpdateAnnotations.fulfilled,
        RetrieveAnnotations.fulfilled
      ),
      (state, action) => {
        // ToDo (VIS-794): conversion logic from V1 to V2 in the new slice can be moved into thunks.
        const annotations: VisionAnnotation<VisionAnnotationDataType>[] =
          convertCDFAnnotationV1ToVisionAnnotations(action.payload);

        // HACK: only update states if annotations belong to one single file
        // to avoid costly state update if thunks are triggered by other pages than review page
        if (
          [...new Set(annotations.map((item) => item.annotatedResourceId))]
            .length > 1
        ) {
          return;
        }

        // get only the keypoint annotations
        const keypointAnnotationCollections = annotations.reduce(
          (
            keypointCollections: VisionAnnotation<ImageKeypointCollection>[],
            ann
          ) => {
            if (isImageKeypointCollectionData(ann)) {
              // ToDo: Remove casting by improving type guards
              keypointCollections.concat(
                ann as VisionAnnotation<ImageKeypointCollection>
              );
            }
            return keypointCollections;
          },
          []
        );

        keypointAnnotationCollections.forEach(
          (keypointAnnotationCollection) => {
            const collectionId = keypointAnnotationCollection.id.toString();
            const keypointIds: string[] = [];

            keypointAnnotationCollection.keypoints.forEach((keypoint) => {
              const keypointId = `${keypointAnnotationCollection.id}-${keypoint.label}`;
              keypointIds.push(keypointId);

              state.keypointMap.byId[keypointId] = {
                id: keypointId,
                selected: true,
                keypoint,
              };
            });

            state.keypointMap.allIds = Object.keys(state.keypointMap.byId);

            state.collections.byId[collectionId] = {
              id: collectionId,
              keypointIds,
              label: keypointAnnotationCollection.label,
              show: true,
              status: AnnotationStatus.Verified,
            };
          }
        );
        state.collections.allIds = Object.keys(state.collections.byId);
      }
    );
    builder.addMatcher(
      isAnyOf(
        PopulateAnnotationTemplates.fulfilled,
        SaveAnnotationTemplates.fulfilled
      ),
      (state, action) => {
        // ToDo: thunk should return PredefinedAnnotations type data
        state.predefinedAnnotations = {
          predefinedKeypointCollections: action.payload.predefinedKeypoints,
          predefinedShapes: action.payload.predefinedShapes,
        };
      }
    );
  },
});

export type { AnnotatorWrapperState as AnnotatorWrapperReducerState };

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
} = annotatorWrapperSlice.actions;

export default annotatorWrapperSlice.reducer;
