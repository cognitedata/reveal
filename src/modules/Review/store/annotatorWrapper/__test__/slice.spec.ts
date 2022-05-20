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
import { ImageKeypoint, Status } from 'src/api/annotation/types';
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
            c1: getDummyKeypointCollectionState('c1', ['c1-label1']),
            c2: getDummyKeypointCollectionState('c2', ['c2-label2']),
          },
          allIds: ['c1', 'c2'],
          selectedIds: ['c1'],
        },
        keypointMap: {
          byId: {
            // ${keypointAnnotationCollection.id}-${keypoint.label}
            'c1-label1': getDummyKeypointState('label1'),
            'c2-label2': getDummyKeypointState('label2'),
          },
          allIds: ['c1-label1', 'c2-label2'],
          selectedIds: ['c1-label1'],
        },
      };

      test('deselect selected keypoint', () => {
        const pointToUpdate: ImageKeypoint = {
          label: 'label1',
          confidence: 0.5,
          point: { x: 0.25, y: 0.75 },
        };
        expect(
          reducer(
            previousState,
            onUpdateKeyPoint({
              keypointAnnotationCollectionId: 'c1',
              label: pointToUpdate.label,
              newConfidence: pointToUpdate.confidence,
              newPoint: pointToUpdate.point,
            })
          ).keypointMap.byId['c1-label1']
        ).toEqual(pointToUpdate);
      });

      test('should not effect others when non existing id used', () => {
        const pointToUpdate: ImageKeypoint = {
          label: 'point',
          confidence: 0.5,
          point: { x: 0.25, y: 0.75 },
        };
        expect(
          reducer(
            previousState,
            onUpdateKeyPoint({
              keypointAnnotationCollectionId: 'c1',
              label: pointToUpdate.label,
              newConfidence: pointToUpdate.confidence,
              newPoint: pointToUpdate.point,
            })
          ).keypointMap.byId['c1-label1']
        ).toEqual({
          label: 'label1',
          confidence: 1,
          point: { x: 0.5, y: 0.5 },
        });
      });
    });

    describe('Test onCreateKeyPoint reducer', () => {
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
            onCreateKeyPoint({
              collectionName: 'non-existing-collection-name',
              keypointLabel: 'left',
              positionX: 0.25,
              positionY: 0.25,
            })
          )
        ).toEqual(previousState);
      });

      test('Should create keypoint collection, for valid collection name', () => {
        const payload = {
          collectionName: 'gauge',
          keypointLabel: 'left', // this will always be the fist on of the collection as we get this from nextKeypoint selector
          positionX: 0.25,
          positionY: 0.25,
        };
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [getDummyPredefinedKeypoint('c1')],
            predefinedShapes: [],
          },
        };

        const newKeypointId = `${payload.collectionName}-${payload.keypointLabel}`;

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.keypointLabel,
          lastCollectionId: payload.collectionName,
          collections: {
            byId: {
              [payload.collectionName]: {
                ...getDummyKeypointCollectionState(payload.collectionName, [
                  newKeypointId,
                ]),
              },
            },
            allIds: [payload.collectionName],
            selectedIds: [payload.collectionName],
          },
          keypointMap: {
            byId: {
              [newKeypointId]: {
                ...getDummyKeypointState(payload.keypointLabel, 1, {
                  x: payload.positionX,
                  y: payload.positionY,
                }),
              },
            },
            allIds: [newKeypointId],
            selectedIds: [], // TODO: should keypoint also be selected?
          },
        };

        expect(reducer(previousState, onCreateKeyPoint(payload))).toEqual(
          updatedState
        );
      });

      test('Should create keypoint collection with lastCollectionId set', () => {
        const payload = {
          collectionName: 'gauge',
          keypointLabel: 'center', // this will always be the fist on of the collection as we get this from nextKeypoint selector
          positionX: 0.25,
          positionY: 0.25,
        };
        const previousState = {
          ...initialState,
          lastCollectionId: 'c1',
          predefinedAnnotations: {
            predefinedKeypointCollections: [getDummyPredefinedKeypoint('c1')],
            predefinedShapes: [],
          },
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
        };

        const newKeypointId = `${payload.collectionName}-${payload.keypointLabel}`;

        const updatedState: AnnotatorWrapperState = {
          ...previousState,
          lastCollectionName: payload.collectionName,
          lastKeyPoint: payload.keypointLabel,
          collections: {
            ...previousState.collections,
            byId: {
              c1: {
                ...previousState.collections.byId.c1,
                keypointIds: [
                  ...previousState.collections.byId.c1.keypointIds,
                  newKeypointId,
                ],
              },
            },
          },
          keypointMap: {
            ...previousState.keypointMap,
            allIds: [...previousState.keypointMap.allIds, newKeypointId],
            byId: {
              ...previousState.keypointMap.byId,
              [newKeypointId]: {
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
