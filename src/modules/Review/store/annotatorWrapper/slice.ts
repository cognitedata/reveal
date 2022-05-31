import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
  Tool,
} from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateAnnotationsV1 } from 'src/store/thunks/Annotation/CreateAnnotationsV1';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { createUniqueNumericId } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { deleteCollection } from 'src/modules/Review/store/annotatorWrapper/utils';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { convertCDFAnnotationV1ToVisionAnnotations } from 'src/api/annotation/bulkConverters';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  Keypoint,
  ImageKeypointCollection,
  Point,
  Status,
} from 'src/api/annotation/types';
import { isImageKeypointCollectionData } from 'src/modules/Common/types/typeGuards';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';

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
      action: PayloadAction<{ id: string; status: Status }>
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
    onCreateKeyPoint(
      state,
      action: PayloadAction<{
        id: string; // id from region
        collectionName: string;
        keypointLabel: string; // use nextKeypoint selector to get keypointLabel
        positionX: number;
        positionY: number;
      }>
    ) {
      const { id, collectionName, keypointLabel, positionX, positionY } =
        action.payload;

      const predefinedKeypointCollection:
        | PredefinedKeypointCollection
        | undefined = state.predefinedAnnotations.predefinedKeypointCollections.find(
        (collection) => collection.collectionName === collectionName
      );

      // validPredefinedKeypointCollection
      if (predefinedKeypointCollection) {
        const { keypoints } = predefinedKeypointCollection;
        state.lastCollectionName = predefinedKeypointCollection.collectionName;

        // collection has keypoints
        if (keypoints) {
          // get the matching keypoint or the first one
          const predefinedKeypoint: PredefinedKeypoint =
            keypoints.find((keypoint) => keypoint.caption === keypointLabel) ||
            keypoints[0];

          const imageKeypointToAdd: Keypoint = {
            label: predefinedKeypoint.caption,
            point: {
              x: positionX,
              y: positionY,
            },
            confidence: 1, // 100% confident about manually created keypoints
          };

          // if last Collection Id not Set
          // start by adding new collection to the state
          // set that collection as last collection
          // and select it
          if (!state.lastCollectionId) {
            const collectionId = createUniqueNumericId().toString(); // TODO make collection id numeric
            const collectionToAdd = {
              id: collectionId,
              keypointIds: [],
              label: collectionName,
              status: Status.Approved,
              show: true,
            };

            state.collections.byId[collectionId] = collectionToAdd;
            state.collections.allIds = Object.keys(state.collections.byId);
            state.lastCollectionId = collectionId;
            state.collections.selectedIds = [collectionId];
          }

          state.lastKeyPoint = predefinedKeypoint.caption;
          state.collections.byId[state.lastCollectionId].keypointIds.push(id);
          state.keypointMap.byId[id] = imageKeypointToAdd;
          state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
        }
      }
    },
    onUpdateKeyPoint(
      state,
      action: PayloadAction<{
        keypointAnnotationCollectionId: string;
        label: string;
        newConfidence: number | undefined;
        newPoint: Point;
      }>
    ) {
      const { keypointAnnotationCollectionId, label, newConfidence, newPoint } =
        action.payload;
      const keypointId = generateKeypointId(
        keypointAnnotationCollectionId,
        label
      );
      if (state.keypointMap.allIds.includes(keypointId)) {
        state.keypointMap.byId[keypointId] = {
          label,
          confidence: newConfidence,
          point: newPoint,
        };
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
        CreateAnnotationsV1.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotationsV1.fulfilled,
        RetrieveAnnotationsV1.fulfilled
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
              const keypointId = generateKeypointId(
                collectionId,
                keypoint.label
              );
              keypointIds.push(keypointId);

              state.keypointMap.byId[keypointId] = keypoint;
            });

            state.keypointMap.allIds = Object.keys(state.keypointMap.byId);

            state.collections.byId[collectionId] = {
              id: collectionId,
              keypointIds,
              label: keypointAnnotationCollection.label,
              show: true,
              status: Status.Approved,
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
          predefinedKeypointCollections:
            action.payload.predefinedKeypointCollections,
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
