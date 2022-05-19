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
import { ReviewImageKeypoint } from 'src/modules/Review/store/review/types';
import { Status } from 'src/api/annotation/types';
import { getDummyPredefinedKeypoint } from 'src/modules/Review/store/annotatorWrapper/__test__/utils';
import {
  getDummyKeypointCollectionState,
  getDummyKeypointState,
} from 'src/__test-utils/annotations';

jest.mock('src/utils/AnnotationUtilsV1/AnnotationUtilsV1', () => ({
  ...jest.requireActual('src/utils/AnnotationUtilsV1/AnnotationUtilsV1'),
  createUniqueId: (text: string) => {
    return text;
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
            c1: getDummyKeypointCollectionState('c1', ['k1']),
            c2: getDummyKeypointCollectionState('c2', ['k2']),
          },
        },
      };

      test('should deselect selected collection and select provided collection', () => {
        const previousState = {
          ...modifiedInitialState,
          collections: {
            ...modifiedInitialState.collections,
            allIds: ['c1', 'c2'],
            selectedIds: ['c1'],
          },
        };

        expect(
          reducer(previousState, selectCollection('c2')).collections.selectedIds
        ).toEqual(['c2']);
      });

      test('should deselect only provided collection', () => {
        const previousState = {
          ...modifiedInitialState,
          collections: {
            ...modifiedInitialState.collections,
            allIds: ['c1', 'c2'],
            selectedIds: ['c1', 'c2'],
          },
        };

        expect(
          reducer(previousState, selectCollection('c2')).collections.selectedIds
        ).toEqual(['c1']);
      });
    });

    describe('Test toggleCollectionVisibility reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            c1: getDummyKeypointCollectionState('c1', ['k1']),
          },
          allIds: ['c1'],
          selectedIds: ['c1'],
        },
      };

      test('should hide visible collection', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility('c1')).collections
            .byId.c1.show
        ).toEqual(false);
      });

      test('should not effect others when non existing id used', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility('c3')).collections
            .byId.c1.show
        ).toEqual(true);
      });
    });

    describe('Test setCollectionStatus reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            c1: getDummyKeypointCollectionState('c1', ['k1']),
          },
          allIds: ['c1'],
          selectedIds: ['c1'],
        },
      };

      test('should set collection status', () => {
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 'c1', status: Status.Rejected })
          ).collections.byId.c1.status
        ).toEqual(Status.Rejected);
      });

      test('should not effect others when non existing id used', () => {
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 'c3', status: Status.Rejected })
          ).collections.byId.c1.status
        ).toEqual(Status.Approved);
      });
    });

    describe('Test keypointSelectStatusChange reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            c1: getDummyKeypointCollectionState('c1', ['k1']),
            c2: getDummyKeypointCollectionState('c2', ['k2']),
          },
          allIds: ['c1', 'c2'],
          selectedIds: ['c1'],
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
        ).toEqual(['c1']);
      });

      test('select non-selected keypoint (for collection c2)', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k2')).keypointMap
            .selectedIds
        ).toEqual(['k2']);
      });

      test('collection selected list not changed', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k1')).collections
            .selectedIds
        ).toEqual(['c1']);
      });

      test('collection selected list not changed for invalid keypoint id', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k3')).collections
            .selectedIds
        ).toEqual(['c1']);
      });
    });

    describe('Test onUpdateKeyPoint reducer', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            c1: getDummyKeypointCollectionState('c1', ['k1']),
            c2: getDummyKeypointCollectionState('c2', ['k2']),
          },
          allIds: ['c1', 'c2'],
          selectedIds: ['c1'],
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
        const pointToUpdate: ReviewImageKeypoint = {
          id: 'k1',
          selected: true,
          keypoint: {
            label: 'point',
            confidence: 0.5,
            point: { x: 0.25, y: 0.75 },
          },
        };
        expect(
          reducer(previousState, onUpdateKeyPoint(pointToUpdate)).keypointMap
            .byId.k1
        ).toEqual(pointToUpdate);
      });

      test('should not effect others when non existing id used', () => {
        const pointToUpdate: ReviewImageKeypoint = {
          id: 'k3',
          selected: true,
          keypoint: {
            label: 'point',
            confidence: 0.5,
            point: { x: 0.25, y: 0.75 },
          },
        };
        expect(
          reducer(previousState, onUpdateKeyPoint(pointToUpdate)).keypointMap
            .byId.k1
        ).toEqual({
          id: 'k1',
          selected: true,
          keypoint: {
            label: 'center',
            confidence: 1,
            point: { x: 0.5, y: 0.5 },
          },
        });
      });
    });

    describe('Test onCreateKeyPoint reducer', () => {
      const payload = {
        id: 'k2',
        collectionName: 'gauge',
        positionX: 1,
        positionY: 2,
        orderNumber: 1,
      };

      test('Should not create keypoint collection, invalid collection name', () => {
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [getDummyPredefinedKeypoint('c1')],
            predefinedShapes: [],
          },
        };
        expect(
          reducer(
            previousState,
            onCreateKeyPoint(
              payload.id,
              'non-existing-collection-name',
              payload.positionX,
              payload.positionY
            )
          )
        ).toEqual(previousState);
      });

      test('Should create keypoint collection', () => {
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [getDummyPredefinedKeypoint('c1')],
            predefinedShapes: [],
          },
        };

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.id,
          lastCollectionId: payload.collectionName,
          collections: {
            byId: {
              [payload.collectionName]: {
                ...getDummyKeypointCollectionState(payload.collectionName, [
                  payload.id,
                ]),
              },
            },
            allIds: [payload.collectionName],
            selectedIds: [payload.collectionName],
          },
          keypointMap: {
            byId: {
              k2: {
                ...getDummyKeypointState(payload.id),
                keypoint: {
                  label: getDummyKeypointState(payload.id).keypoint.label,
                  point: { x: payload.positionX, y: payload.positionY },
                  confidence: 1,
                },
              },
            },
            allIds: [payload.id],
            selectedIds: [], // TODO: should keypoint also be selected?
          },
        };

        expect(
          reducer(
            previousState,
            onCreateKeyPoint(
              payload.id,
              payload.collectionName,
              payload.positionX,
              payload.positionY
            )
          )
        ).toEqual(updatedState);
      });

      test('Should create keypoint collection with lastCollectionId set', () => {
        const previousState = {
          ...initialState,
          lastCollectionId: 'c1',
          collections: {
            byId: {
              c1: getDummyKeypointCollectionState('c1', ['k1']),
            },
            allIds: ['c1'],
            selectedIds: ['c1'],
          },
          keypointMap: {
            byId: { k1: getDummyKeypointState('k1') },
            allIds: ['k1'],
            selectedIds: ['k1'],
          },
          predefinedAnnotations: {
            predefinedKeypointCollections: [getDummyPredefinedKeypoint('c1')],
            predefinedShapes: [],
          },
        };

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.id,
          collections: {
            ...previousState.collections,
            byId: {
              c1: {
                ...previousState.collections.byId.c1,
                keypointIds: [
                  ...previousState.collections.byId.c1.keypointIds,
                  payload.id,
                ],
              },
            },
          },
          keypointMap: {
            ...previousState.keypointMap,
            allIds: [...previousState.keypointMap.allIds, payload.id],
            byId: {
              ...previousState.keypointMap.byId,
              k2: {
                ...getDummyKeypointState(payload.id),
                keypoint: {
                  label: getDummyKeypointState(payload.id).keypoint.label,
                  point: { x: payload.positionX, y: payload.positionY },
                  confidence: 1,
                },
              },
            },
          },
        };

        expect(
          reducer(
            previousState,
            onCreateKeyPoint(
              payload.id,
              payload.collectionName,
              payload.positionX,
              payload.positionY
            )
          )
        ).toEqual(updatedState);
      });
    });
  });

  describe('Test extraReducers', () => {
    // ToDo: add tests for extraReducers after thunks were migrated to V2 types
  });
});
