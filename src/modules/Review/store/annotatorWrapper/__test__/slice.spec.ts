import reducer, {
  initialState,
  keypointSelectStatusChange,
  onCreateKeyPoint,
  onUpdateKeyPoint,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotatorWrapper/slice';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { Keypoint, Status } from 'src/api/annotation/types';
import {
  getDummyKeypointCollectionState,
  getDummyKeypointState,
  getDummyPredefinedKeypointCollection,
} from 'src/__test-utils/annotations';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotatorPointRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { getDummyRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/__test-utils/region';
import {
  getDummyImageKeypointCollectionAnnotation,
  getDummyVisionReviewAnnotation,
} from 'src/__test-utils/getDummyAnnotations';
import { VisionReviewAnnotation } from 'src/modules/Review/types';

jest.mock('src/utils/AnnotationUtilsV1/AnnotationUtilsV1', () => ({
  ...jest.requireActual('src/utils/AnnotationUtilsV1/AnnotationUtilsV1'),
  createUniqueNumericId: () => {
    return 'gauge';
  },
}));

describe('Test annotator slice', () => {
  test('reducer should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('Test reducers', () => {
    describe('Test selectCollection reducer', () => {
      const modifiedInitialState = {
        ...initialState,
        collections: {
          byId: {
            1: getDummyKeypointCollectionState(1, ['k1']),
            2: getDummyKeypointCollectionState(2, ['k2']),
          },
        },
      };

      test('should deselect selected collection and select provided collection', () => {
        const previousState = {
          ...modifiedInitialState,
          collections: {
            ...modifiedInitialState.collections,
            allIds: [1, 2],
            selectedIds: [1],
          },
        };

        expect(
          reducer(previousState, selectCollection(2)).collections.selectedIds
        ).toEqual([2]);
      });

      test('should deselect only provided collection', () => {
        const previousState = {
          ...modifiedInitialState,
          collections: {
            ...modifiedInitialState.collections,
            allIds: [1, 2],
            selectedIds: [1, 2],
          },
        };

        expect(
          reducer(previousState, selectCollection(2)).collections.selectedIds
        ).toEqual([1]);
      });
    });

    describe('Test toggleCollectionVisibility reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            1: getDummyKeypointCollectionState(1, ['k1']),
          },
          allIds: [1],
          selectedIds: [1],
        },
      };

      test('should hide visible collection', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility(1)).collections
            .byId[1].show
        ).toEqual(false);
      });

      test('should not effect others when non existing id used', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility(3)).collections
            .byId[1].show
        ).toEqual(true);
      });
    });

    describe('Test setCollectionStatus reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            1: getDummyKeypointCollectionState(1, ['k1']),
          },
          allIds: [1],
          selectedIds: [1],
        },
      };

      test('should set collection status', () => {
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 1, status: Status.Rejected })
          ).collections.byId[1].status
        ).toEqual(Status.Rejected);
      });

      test('should not effect others when non existing id used', () => {
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 3, status: Status.Rejected })
          ).collections.byId[1].status
        ).toEqual(Status.Approved);
      });
    });

    describe('Test keypointSelectStatusChange reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            1: getDummyKeypointCollectionState(1, ['k1']),
            2: getDummyKeypointCollectionState(2, ['k2']),
          },
          allIds: [1, 2],
          selectedIds: [1],
        },
        keypointMap: {
          byId: {
            k1: getDummyKeypointState('k1'),
            k2: getDummyKeypointState('k2'),
          },
          allIds: ['k1', 'k2'],
          selectedIds: ['k1'],
        },
      };

      test('deselect selected keypoint', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k1')).keypointMap
            .selectedIds
        ).toEqual([]);
      });

      test('collection still selected', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k1')).collections
            .selectedIds
        ).toEqual([1]);
      });

      test('select non-selected keypoint (for collection with id 2)', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k2')).keypointMap
            .selectedIds
        ).toEqual(['k2']);
      });

      test('collection selected list not changed', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k1')).collections
            .selectedIds
        ).toEqual([1]);
      });

      test('collection selected list not changed for invalid keypoint id', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k3')).collections
            .selectedIds
        ).toEqual([1]);
      });
    });

    describe.skip('Test onUpdateKeyPoint reducer', () => {
      const k1Id = generateKeypointId(1, 'left');
      const k2Id = generateKeypointId(1, 'center');

      const previousState = {
        ...initialState,
        collections: {
          byId: {
            1: getDummyKeypointCollectionState(1, [k1Id]),
            2: getDummyKeypointCollectionState(2, [k2Id]),
          },
          allIds: [1, 2],
          selectedIds: [1],
        },
        keypointMap: {
          byId: {
            k1Id: getDummyKeypointState('left'),
            k2Id: getDummyKeypointState('center'),
          },
          allIds: [k1Id, k2Id],
          selectedIds: [k1Id],
        },
      };

      test('should update confidence and point', () => {
        const pointToUpdate: Keypoint = {
          label: 'left',
          confidence: 0.5,
          point: { x: 0.25, y: 0.75 },
        };
        const collectionId = 1;

        expect(
          reducer(
            previousState,
            onUpdateKeyPoint({
              keypointAnnotationCollectionId: collectionId,
              label: pointToUpdate.label,
              newConfidence: pointToUpdate.confidence,
              newPoint: pointToUpdate.point,
            })
          )
        ).toEqual({
          ...previousState,
          keypointMap: {
            ...previousState.keypointMap,
            byId: { ...previousState.keypointMap.byId, [k1Id]: pointToUpdate },
          },
        });
      });

      test('should not effect others when non existing label used', () => {
        const pointToUpdate: Keypoint = {
          label: 'non-existing-label',
          confidence: 0.5,
          point: { x: 0.25, y: 0.75 },
        };
        expect(
          reducer(
            previousState,
            onUpdateKeyPoint({
              keypointAnnotationCollectionId: 1,
              label: pointToUpdate.label,
              newConfidence: pointToUpdate.confidence,
              newPoint: pointToUpdate.point,
            })
          )
        ).toEqual(previousState);
      });
    });

    describe.skip('Test onCreateKeyPoint reducer', () => {
      test('Should not create keypoint collection, invalid collection name', () => {
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [
              getDummyPredefinedKeypointCollection(1),
            ],
            predefinedShapes: [],
          },
        };
        expect(
          reducer(
            previousState,
            onCreateKeyPoint({
              id: 'random-id',
              collectionName: 'non-existing-collection-name',
              keypointLabel: 'left',
              positionX: 0.25,
              positionY: 0.25,
            } as any)
          )
        ).toEqual(previousState);
      });

      test('Should create keypoint collection, for valid collection name', () => {
        const idFromRegion = 'id-from-region';
        const payload = {
          id: idFromRegion,
          collectionName: 'gauge',
          keypointLabel: 'left', // this will always be the fist on of the collection as we get this from nextKeypoint selector
          positionX: 0.25,
          positionY: 0.25,
        };
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [
              getDummyPredefinedKeypointCollection(1),
            ],
            predefinedShapes: [],
          },
        };

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.keypointLabel,
          lastCollectionId: payload.collectionName, // actually generated ID by using collectionName
          collections: {
            byId: {
              [payload.collectionName]: {
                ...getDummyKeypointCollectionState(payload.collectionName, [
                  idFromRegion,
                ]),
              },
            },
            allIds: [payload.collectionName],
            selectedIds: [payload.collectionName],
          },
          keypointMap: {
            byId: {
              [idFromRegion]: {
                ...getDummyKeypointState(payload.keypointLabel, 1, {
                  x: payload.positionX,
                  y: payload.positionY,
                }),
              },
            },
            allIds: [idFromRegion],
            selectedIds: [], // TODO: should keypoint also be selected?
          },
        };

        expect(reducer(previousState, onCreateKeyPoint(payload))).toEqual(
          updatedState
        );
      });

      test('Should create keypoint collection with lastCollectionId set', () => {
        const idFromRegion = 'id-from-region';
        const payload = {
          id: idFromRegion,
          collectionName: 'gauge',
          keypointLabel: 'center', // this will always be the fist on of the collection as we get this from nextKeypoint selector
          positionX: 0.25,
          positionY: 0.25,
        };
        const previousState = {
          ...initialState,
          lastCollectionId: 1,
          predefinedAnnotations: {
            predefinedKeypointCollections: [
              getDummyPredefinedKeypointCollection(1),
            ],
            predefinedShapes: [],
          },
          collections: {
            byId: {
              1: getDummyKeypointCollectionState(1, ['k1']),
            },
            allIds: [1],
            selectedIds: [1],
          },
          keypointMap: {
            byId: { k1: getDummyKeypointState('k1') },
            allIds: ['k1'],
            selectedIds: ['k1'],
          },
        };

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.keypointLabel,
          collections: {
            ...previousState.collections,
            byId: {
              1: {
                ...previousState.collections.byId[1],
                keypointIds: [
                  ...previousState.collections.byId[1].keypointIds,
                  idFromRegion,
                ],
              },
            },
          },
          keypointMap: {
            ...previousState.keypointMap,
            allIds: [...previousState.keypointMap.allIds, idFromRegion],
            byId: {
              ...previousState.keypointMap.byId,
              [idFromRegion]: {
                ...getDummyKeypointState(payload.keypointLabel, 1, {
                  x: payload.positionX,
                  y: payload.positionY,
                }),
              },
            },
          },
        };

        expect(reducer(previousState, onCreateKeyPoint(payload))).toEqual(
          updatedState
        );
      });
    });
  });

  describe('Test extraReducers', () => {
    // ToDo: add tests for extraReducers after thunks were migrated to V2 types
  });
});
