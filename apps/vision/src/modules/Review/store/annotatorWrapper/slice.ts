import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import isFinite from 'lodash/isFinite';

import {
  ImageKeypointCollection,
  Keypoint,
  Status,
} from '../../../../api/annotation/types';
import { deselectAllSelectionsReviewPage } from '../../../../store/commonActions';
import { PopulateAnnotationTemplates } from '../../../../store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from '../../../../store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from '../../../../store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from '../../../../store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from '../../../../store/thunks/Annotation/UpdateAnnotations';
import { VisionJobUpdate } from '../../../../store/thunks/Process/VisionJobUpdate';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '../../../Common/types';
import { isImageKeypointCollectionData } from '../../../Common/types/typeGuards';
import {
  createUniqueNumericId,
  generateKeypointId,
} from '../../../Common/Utils/AnnotationUtils/AnnotationUtils';
import { tools } from '../../Components/ReactImageAnnotateWrapper/Tools';
import {
  AnnotatorNewRegion,
  AnnotatorPointRegion,
  isAnnotatorPointRegion,
} from '../../Components/ReactImageAnnotateWrapper/types';
import { PredefinedKeypoint, Tool } from '../../types';

import { AnnotatorWrapperState } from './type';
import {
  deleteCollection,
  getKeypointForAnnotatorPointRegion,
  populateTempKeypointCollection,
  updateLastCollectionName,
  updateLastShape,
} from './utils';

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
      updateLastShape(state, action.payload);
    },
    setLastCollectionName(state, action: PayloadAction<string>) {
      updateLastCollectionName(state, action.payload);
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

            state.temporaryRegion = undefined; // reset temp region - otherwise keypoint will be duplicated

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
    onCreateRegion(state, action: PayloadAction<AnnotatorNewRegion>) {
      // update last shape and collection name if label is available
      if (
        action.payload.annotationLabelOrText &&
        (!state.temporaryRegion?.annotationLabelOrText ||
          (state.temporaryRegion?.annotationLabelOrText &&
            state.temporaryRegion?.annotationLabelOrText !==
              action.payload.annotationLabelOrText)) // last shape should only be set only if tempRegion label is empty or if it exists provided region label is different from that
      ) {
        if (isAnnotatorPointRegion(action.payload)) {
          updateLastCollectionName(state, action.payload.annotationLabelOrText);
        } else {
          updateLastShape(state, action.payload.annotationLabelOrText);
        }
      }
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
          console.warn(
            'This region cannot be added. temp keypoint collection does not exist'
          );
        }
      }
    },
    onUpdateRegion(state, action: PayloadAction<AnnotatorNewRegion>) {
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

      // if updated region same as temp region, update temp region in state
      if (state.temporaryRegion && regionId === state.temporaryRegion.id) {
        // update last shape and collection name if label changed on a temporary annotation (before clicking create button)
        if (
          action.payload.annotationLabelOrText &&
          (!state.temporaryRegion?.annotationLabelOrText ||
            (state.temporaryRegion?.annotationLabelOrText &&
              state.temporaryRegion?.annotationLabelOrText !==
                action.payload.annotationLabelOrText)) // last shape should only be set only if tempRegion label is empty or if it exists provided region label is different from that
        ) {
          if (isAnnotatorPointRegion(action.payload)) {
            updateLastCollectionName(
              state,
              action.payload.annotationLabelOrText
            );
          } else {
            updateLastShape(state, action.payload.annotationLabelOrText);
          }
        }

        state.temporaryRegion = {
          ...state.temporaryRegion,
          ...action.payload,
        };

        if (
          isAnnotatorPointRegion(action.payload) &&
          state.isCreatingKeypointCollection &&
          state.lastCollectionId // temp keypoint collection is available and temp region is available
        ) {
          // populate temp keypoint collection
          populateTempKeypointCollection(state, action.payload);
        }
      } else if (
        isAnnotatorPointRegion(action.payload) &&
        state.keypointMap.allIds.includes(String(regionId))
      ) {
        updateKeypoint(regionId, action.payload);
      } else {
        console.warn('provided region is not a valid region update');
      }
    },
    clearTemporaryRegion(state) {
      state.temporaryRegion = undefined;
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
  onCreateRegion,
  onUpdateRegion,
  createTempKeypointCollection,
  clearTemporaryRegion,
} = annotatorWrapperSlice.actions;

export default annotatorWrapperSlice.reducer;
