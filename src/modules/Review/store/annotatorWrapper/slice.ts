import isFinite from 'lodash-es/isFinite';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import { PredefinedKeypoint, Tool } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import {
  deleteCollection,
  getKeypointForAnnotatorPointRegion,
  populateTempKeypointCollection,
} from 'src/modules/Review/store/annotatorWrapper/utils';
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
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import {
  AnnotatorNewRegion,
  AnnotatorPointRegion,
  isAnnotatorPointRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import {
  createUniqueNumericId,
  generateKeypointId,
} from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';

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
  isCreatingKeypointCollection: false,
  temporaryRegion: undefined,
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
      const keypointState = state.keypointMap.byId[action.payload];

      // if keypoint exists in state
      if (keypointState) {
        const status = state.keypointMap.selectedIds.includes(action.payload);
        if (status) {
          state.keypointMap.selectedIds = state.keypointMap.selectedIds.filter(
            (id) => id !== action.payload
          );
        } else {
          state.keypointMap.selectedIds = [action.payload];
        }
      }
    },
    setLastShape(state, action: PayloadAction<string>) {
      if (
        state.predefinedAnnotations.predefinedShapes
          .map((predefinedShape) => predefinedShape.shapeName)
          .includes(action.payload)
      ) {
        state.lastShape = action.payload;
      } else {
        console.warn(
          'Provided shape name is not one of the predefined annotations'
        );
      }
    },
    setLastCollectionName(state, action: PayloadAction<string>) {
      if (
        state.predefinedAnnotations.predefinedKeypointCollections
          .map((predefinedCollection) => predefinedCollection.collectionName)
          .includes(action.payload)
      ) {
        state.lastCollectionName = action.payload;
      } else {
        console.warn(
          'Provided collection name is not one of the predefined annotations'
        );
      }
    },
    setSelectedTool(state, action: PayloadAction<Tool>) {
      if (Object.values(tools).includes(action.payload)) {
        state.currentTool = action.payload;
      } else {
        console.warn("provided tool doesn't exist");
      }
    },
    deleteTempKeypointCollection(state) {
      state.isCreatingKeypointCollection = false;
      const currentCollectionId = state.lastCollectionId;
      if (currentCollectionId) {
        deleteCollection(state, currentCollectionId);
      }
    },
    setKeepUnsavedRegion(state, action: PayloadAction<boolean>) {
      state.keepUnsavedRegion = action.payload;
    },
    createTempKeypointCollection(state) {
      const { id, annotationLabelOrText, keypointLabel, x, y } =
        (state.temporaryRegion as AnnotatorPointRegion) || {};
      if (
        id &&
        isFinite(x) &&
        isFinite(y) &&
        annotationLabelOrText &&
        keypointLabel
      ) {
        const predefinedKeypointCollection =
          state.predefinedAnnotations.predefinedKeypointCollections.find(
            (collection) => collection.collectionName === annotationLabelOrText
          );

        // valid PredefinedKeypointCollection is available
        if (predefinedKeypointCollection) {
          const { keypoints } = predefinedKeypointCollection;
          state.lastCollectionName =
            predefinedKeypointCollection.collectionName;

          if (keypoints && keypoints.length) {
            // if collection has keypoints
            const predefinedKeypoint: PredefinedKeypoint =
              keypoints.find(
                (keypoint) => keypoint.caption === keypointLabel
              ) || keypoints[0];
            const imageKeypointToAdd: Keypoint = {
              point: { x, y },
              confidence: 1, // 100% confident about manually created keypoints
            };

            // create temp keypoint collection

            const collectionId = createUniqueNumericId();
            state.collections.byId[collectionId] = {
              id: collectionId,
              keypointIds: [String(id)],
              label: annotationLabelOrText,
              status: Status.Approved,
              show: true,
            };
            state.collections.allIds = Object.keys(state.collections.byId).map(
              (key) => +key
            );
            state.lastCollectionId = collectionId;
            state.collections.selectedIds = [collectionId];

            // update keypoints
            state.lastKeyPoint = predefinedKeypoint.caption;
            state.keypointMap.byId[id] = {
              label: keypointLabel,
              ...imageKeypointToAdd,
            };
            state.keypointMap.allIds = Object.keys(state.keypointMap.byId);

            state.isCreatingKeypointCollection = true;
          } else {
            console.warn('predefined collection has no keypoints!');
          }
        } else {
          console.warn('predefined keypoint collection not found!');
        }
      } else {
        console.warn('annotation label or keypoint label not found!');
      }
    },
    onCreateKeypointRegion(state, action: PayloadAction<AnnotatorNewRegion>) {
      state.temporaryRegion = action.payload;
      if (isAnnotatorPointRegion(action.payload)) {
        if (state.isCreatingKeypointCollection && state.lastCollectionId) {
          // temp keypoint collection is available
          const tempCollection = state.collections.byId[state.lastCollectionId];

          if (tempCollection.keypointIds.includes(String(action.payload.id))) {
            console.warn('keypoint with the region id already exists');
          } else {
            // populate temp keypoint collection

            populateTempKeypointCollection(state, action.payload);
          }
        } else {
          console.warn('temp keypoint collection does not exist');
        }
      } else {
        console.warn('provided region is not a point region');
      }
    },
    onUpdateKeypointRegion(state, action: PayloadAction<AnnotatorNewRegion>) {
      const regionId = action.payload.id;

      const updateKeypoint = (
        id: string | number,
        payload: AnnotatorNewRegion
      ) => {
        const keypointObj = getKeypointForAnnotatorPointRegion(
          payload as AnnotatorPointRegion
        );
        if (keypointObj) {
          state.keypointMap.byId[id] = keypointObj;
        }
      };

      if (isAnnotatorPointRegion(action.payload)) {
        // if updated region same as temp region, update temp region in state
        if (state.temporaryRegion && regionId === state.temporaryRegion.id) {
          state.temporaryRegion = {
            ...state.temporaryRegion,
            ...action.payload,
          };

          if (
            state.isCreatingKeypointCollection &&
            state.lastCollectionId // temp keypoint collection is available and temp region is available
          ) {
            const tempCollection =
              state.collections.byId[state.lastCollectionId];

            if (tempCollection.keypointIds.includes(String(regionId))) {
              updateKeypoint(regionId, action.payload);
            } else {
              // populate temp keypoint collection
              populateTempKeypointCollection(state, action.payload);
            }
          }
        } else if (state.keypointMap.allIds.includes(String(regionId))) {
          updateKeypoint(regionId, action.payload);
        } else {
          console.warn('provided region is not a point update');
        }
      } else {
        console.warn('provided region is not a point region');
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      state.collections.selectedIds = [];
      state.keypointMap.selectedIds = [];
      state.temporaryRegion = undefined;
      state.isCreatingKeypointCollection = false;
      if (state.lastCollectionId) {
        // delete temp keypoint collection
        const tempKeypointCollectionId = state.lastCollectionId;
        if (tempKeypointCollectionId) {
          deleteCollection(state, tempKeypointCollectionId);
        }
      }
    });
    // Matchers
    builder.addMatcher(
      isAnyOf(
        SaveAnnotations.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled,
        RetrieveAnnotations.fulfilled
      ),
      (state: AnnotatorWrapperState, action) => {
        const annotations: VisionAnnotation<VisionAnnotationDataType>[] =
          action.payload;

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
              return keypointCollections.concat(
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

            Object.entries(keypointAnnotationCollection.keypoints).forEach(
              ([label, keypoint]) => {
                const keypointId = generateKeypointId(collectionId, label);
                keypointIds.push(keypointId);
                state.keypointMap.byId[keypointId] = { label, ...keypoint };
              }
            );

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
  deleteTempKeypointCollection,
  setKeepUnsavedRegion,
  onCreateKeypointRegion,
  onUpdateKeypointRegion,
  createTempKeypointCollection,
} = annotatorWrapperSlice.actions;

export default annotatorWrapperSlice.reducer;
