import isFinite from 'lodash-es/isFinite';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { PredefinedKeypoint, Tool } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { CreateAnnotationsV1 } from 'src/store/thunks/Annotation/CreateAnnotationsV1';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { createUniqueNumericId } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { deleteCollection } from 'src/modules/Review/store/annotatorWrapper/utils';
import { convertCDFAnnotationV1ToVisionAnnotations } from 'src/api/annotation/bulkConverters';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  ImageKeypointCollection,
  Keypoint,
  Status,
} from 'src/api/annotation/types';
import { isImageKeypointCollectionData } from 'src/modules/Common/types/typeGuards';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { VisionJobUpdateV1 } from 'src/store/thunks/Process/VisionJobUpdateV1';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { AnnotatorPointRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';

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
    selectCollection(state, action: PayloadAction<number>) {
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
    toggleCollectionVisibility(state, action: PayloadAction<number>) {
      const collection = state.collections.byId[action.payload];
      if (collection) {
        collection.show = !collection.show;
      }
    },
    setCollectionStatus(
      state,
      action: PayloadAction<{ id: number; status: Status }>
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
    onCreateKeyPoint(state, action: PayloadAction<AnnotatorPointRegion>) {
      const { id, annotationLabelOrText, x, y, keypointLabel } = action.payload;

      const predefinedKeypointCollection =
        state.predefinedAnnotations.predefinedKeypointCollections.find(
          (collection) => collection.collectionName === annotationLabelOrText
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
              x,
              y,
            },
            confidence: 1, // 100% confident about manually created keypoints
          };

          // if last Collection Id not Set
          // start by adding new collection to the state
          // set that collection as last collection
          // and select it
          if (!state.lastCollectionId) {
            const collectionId = createUniqueNumericId();
            state.collections.byId[collectionId] = {
              id: collectionId,
              keypointIds: [],
              label: annotationLabelOrText,
              status: Status.Approved,
              show: true,
            };
            state.collections.allIds = Object.keys(state.collections.byId).map(
              (key) => +key
            );
            state.lastCollectionId = collectionId;
            state.collections.selectedIds = [collectionId];
          }

          state.lastKeyPoint = predefinedKeypoint.caption;
          state.collections.byId[state.lastCollectionId].keypointIds.push(
            String(id)
          );
          state.keypointMap.byId[id] = imageKeypointToAdd;
          state.keypointMap.allIds = Object.keys(state.keypointMap.byId);
        }
      }
    },
    onUpdateKeyPoint(state, action: PayloadAction<AnnotatorPointRegion>) {
      const { parentAnnotationId, keypointLabel, keypointConfidence, x, y } =
        action.payload;
      if (parentAnnotationId && keypointLabel && isFinite(x) && isFinite(y)) {
        const keypointId = generateKeypointId(
          parentAnnotationId,
          keypointLabel
        );
        if (state.keypointMap.allIds.includes(keypointId)) {
          state.keypointMap.byId[keypointId] = {
            label: keypointLabel,
            confidence: keypointConfidence,
            point: { x, y },
          };
        }
      }
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
        VisionJobUpdateV1.fulfilled,
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
            const collectionId = keypointAnnotationCollection.id;
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
        state.collections.allIds = Object.keys(state.collections.byId).map(
          (key) => +key
        );
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
  deleteCurrentCollection,
  removeLabels,
  setKeepUnsavedRegion,
} = annotatorWrapperSlice.actions;

export default annotatorWrapperSlice.reducer;
