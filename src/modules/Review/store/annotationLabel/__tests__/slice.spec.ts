import { Point } from '@cognite/react-image-annotate';
import { RegionType } from 'src/api/vision/detectionModels/types';

import { AnnotationSourceV1 } from 'src/api/annotation/types';
import reducer, {
  initialState,
  keypointSelectStatusChange,
  onCreateKeyPoint,
  onUpdateKeyPoint,
  selectCollection,
  setCollectionStatus,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotationLabel/slice';
import { CreateAnnotationsV1 } from 'src/store/thunks/Annotation/CreateAnnotationsV1';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import {
  AnnotationStatus,
  AnnotationUtilsV1,
  KeypointVertex,
  VisionAnnotationRegion,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';

jest.mock('src/utils/AnnotationUtilsV1/AnnotationUtilsV1', () => ({
  ...jest.requireActual('src/utils/AnnotationUtilsV1/AnnotationUtilsV1'),
  createUniqueId: (text: string) => {
    return text;
  },
}));

describe('Test annotationLabel reducer', () => {
  const dummyKeypointState = (id: string) => {
    return {
      id,
      caption: 'center',
      order: '1',
      color: 'red',
    };
  };

  const dummyKeypointCollectionState = (id: string, keypointIds: string[]) => {
    return {
      id,
      keypointIds,
      name: 'gauge',
      show: true,
      status: AnnotationStatus.Verified,
    };
  };

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('Test selectCollection', () => {
    const modfiedIntialState = {
      ...initialState,
      collections: {
        byId: {
          c1: dummyKeypointCollectionState('c1', ['k1']),
          c2: dummyKeypointCollectionState('c2', ['k2']),
        },
      },
    };
    test('should deselect selected collection and select provided collection', () => {
      const previousState = {
        ...modfiedIntialState,
        collections: {
          ...modfiedIntialState.collections,
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
        ...modfiedIntialState,
        collections: {
          ...modfiedIntialState.collections,
          allIds: ['c1', 'c2'],
          selectedIds: ['c1', 'c2'],
        },
      };

      expect(
        reducer(previousState, selectCollection('c2')).collections.selectedIds
      ).toEqual(['c1']);
    });
  });

  test('toggleCollectionVisibility - should hide visible collection', () => {
    const previousState = {
      ...initialState,
      collections: {
        byId: {
          c1: dummyKeypointCollectionState('c1', ['k1']),
        },
        allIds: ['c1'],
        selectedIds: ['c1'],
      },
    };

    expect(
      reducer(previousState, toggleCollectionVisibility('c1')).collections.byId
        .c1.show
    ).toEqual(false);

    // non existing id
    expect(
      reducer(previousState, toggleCollectionVisibility('c3')).collections.byId
        .c1.show
    ).toEqual(true);
  });

  test('setCollectionStatus - should set collection status', () => {
    const previousState = {
      ...initialState,
      collections: {
        byId: {
          c1: dummyKeypointCollectionState('c1', ['k1']),
        },
        allIds: ['c1'],
        selectedIds: ['c1'],
      },
    };

    expect(
      reducer(
        previousState,
        setCollectionStatus({ id: 'c1', status: AnnotationStatus.Rejected })
      ).collections.byId.c1.status
    ).toEqual(AnnotationStatus.Rejected);

    // non existing id
    expect(
      reducer(
        previousState,
        setCollectionStatus({ id: 'c3', status: AnnotationStatus.Rejected })
      ).collections.byId.c1.status
    ).toEqual(AnnotationStatus.Verified);
  });

  test('keypointSelectStatusChange - should change status for keypoints when selected', () => {
    const previousState = {
      ...initialState,
      collections: {
        byId: {
          c1: dummyKeypointCollectionState('c1', ['k1']),
          c2: dummyKeypointCollectionState('c2', ['k2']),
        },
        allIds: ['c1', 'c2'],
        selectedIds: ['c1'],
      },
      keypointMap: {
        byId: { k1: dummyKeypointState('k1'), k2: dummyKeypointState('k2') },
        allIds: ['k1', 'k2'],
        selectedIds: ['k1'],
      },
    };

    // deselect selected keypoint
    expect(
      reducer(previousState, keypointSelectStatusChange('k1')).keypointMap
        .selectedIds
    ).toEqual([]);

    // collection still selected
    expect(
      reducer(previousState, keypointSelectStatusChange('k1')).collections
        .selectedIds
    ).toEqual(['c1']);

    // select non-selected keypoint (for collection c2)
    expect(
      reducer(previousState, keypointSelectStatusChange('k2')).keypointMap
        .selectedIds
    ).toEqual(['k2']);

    // collection selected list not changed
    expect(
      reducer(previousState, keypointSelectStatusChange('k1')).collections
        .selectedIds
    ).toEqual(['c1']);

    // collection selected list not changed for invalid keypoint id
    expect(
      reducer(previousState, keypointSelectStatusChange('k3')).collections
        .selectedIds
    ).toEqual(['c1']);
  });

  test('onUpdateKeyPoint - should update keypoint location on update', () => {
    const previousState = {
      ...initialState,
      collections: {
        byId: {
          c1: dummyKeypointCollectionState('c1', ['k1']),
          c2: dummyKeypointCollectionState('c2', ['k2']),
        },
        allIds: ['c1', 'c2'],
        selectedIds: ['c1'],
      },
      keypointMap: {
        byId: { k1: dummyKeypointState('k1'), k2: dummyKeypointState('k2') },
        allIds: ['k1', 'k2'],
        selectedIds: ['k1'],
      },
    };

    expect(
      reducer(
        previousState,
        onUpdateKeyPoint({ type: 'point', x: 1, y: 2, id: 'k1' } as Point)
      ).keypointMap.byId.k1.defaultPosition
    ).toEqual([1, 2]);

    // Non-existing keypoint
    expect(
      reducer(
        previousState,
        onUpdateKeyPoint({ type: 'point', x: 1, y: 2, id: 'k3' } as Point)
      ).keypointMap.byId.k1.defaultPosition
    ).toEqual(undefined);
  });

  describe('Test onCreateKeyPoint', () => {
    const dummyKeypoint = () => {
      return {
        caption: 'center',
        order: '1',
        color: 'red',
      };
    };
    const dummyKeypointCollection = (id: string) => {
      return {
        id,
        collectionName: 'gauge',
        keypoints: [dummyKeypoint()],
      };
    };

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
          predefinedKeypointCollections: [dummyKeypointCollection('c1')],
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
          predefinedKeypointCollections: [dummyKeypointCollection('c1')],
          predefinedShapes: [],
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
      ).toEqual({
        ...previousState,
        lastCollectionName: payload.collectionName,
        lastKeyPoint: payload.id,
        lastCollectionId: payload.collectionName,
        collections: {
          byId: {
            [payload.collectionName]: {
              ...dummyKeypointCollectionState(payload.collectionName, [
                payload.id,
              ]),
              selected: true,
            },
          },
          allIds: [payload.collectionName],
          selectedIds: [payload.collectionName],
        },
        keypointMap: {
          byId: {
            k2: {
              ...dummyKeypointState(payload.id),
              defaultPosition: [
                payload.positionX,
                payload.positionY,
              ] as number[],
            },
          },
          allIds: [payload.id],
          selectedIds: [], // TODO: should keypoint also be selected?
        },
      });
    });

    test('Should create keypoint collection with lastCollectionId set', () => {
      const previousState = {
        ...initialState,
        lastCollectionId: 'c1',
        collections: {
          byId: {
            c1: dummyKeypointCollectionState('c1', ['k1']),
          },
          allIds: ['c1'],
          selectedIds: ['c1'],
        },
        keypointMap: {
          byId: { k1: dummyKeypointState('k1') },
          allIds: ['k1'],
          selectedIds: ['k1'],
        },
        predefinedAnnotations: {
          predefinedKeypointCollections: [dummyKeypointCollection('c1')],
          predefinedShapes: [],
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
      ).toEqual({
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
              ...dummyKeypointState(payload.id),
              defaultPosition: [
                payload.positionX,
                payload.positionY,
              ] as number[],
            },
          },
        },
      });
    });
  });

  describe('Test extraReducers', () => {
    test('should deselect all selections', () => {
      const previousState = {
        ...initialState,
        collections: {
          byId: {
            c1: dummyKeypointCollectionState('c1', ['k1']),
            c2: dummyKeypointCollectionState('c2', ['k2']),
          },
          allIds: ['c1', 'c2'],
          selectedIds: ['c1'],
        },
        keypointMap: {
          byId: { k1: dummyKeypointState('k1'), k2: dummyKeypointState('k2') },
          allIds: ['k1', 'k2'],
          selectedIds: ['k1'],
        },
      };

      const action = {
        type: deselectAllSelectionsReviewPage,
      };

      expect(reducer(previousState, action)).toEqual({
        ...previousState,
        collections: {
          ...previousState.collections,
          selectedIds: [],
        },
        keypointMap: {
          ...previousState.keypointMap,
          selectedIds: [],
        },
      });
    });

    test('should set predefined annotations when thunk response is fulfilled', () => {
      const keypointCollection = {
        id: '123',
        collectionName: 'gauge',
        keypoints: [
          {
            id: '0',
            caption: 'center',
            order: '0',
            color: 'red',
          },
          {
            id: '1',
            caption: 'left',
            order: '1',
            color: 'blue',
          },
        ],
      };

      const shape = {
        shapeName: 'gauge',
        color: 'red',
      };

      [
        PopulateAnnotationTemplates.fulfilled.type,
        SaveAnnotationTemplates.fulfilled.type,
      ].forEach((type) => {
        const action = {
          type,
          payload: {
            predefinedKeypointCollections: [keypointCollection],
            predefinedShapes: [shape],
          },
        };
        expect(reducer(initialState, action)).toEqual({
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [keypointCollection],
            predefinedShapes: [shape],
          },
        });
      });
    });

    describe('Test population of collections in state', () => {
      const payload = {
        id: 1,
        text: 'gauge',
        modelType: 1,
        fileId: 10,
        createdTime: 1,
        lastUpdatedTime: 1,
        region: {
          shape: 'points',
          vertices: [
            {
              x: 0,
              y: 0,
              id: '99',
              selected: false,
              caption: 'center',
              order: '0',
              color: 'red',
            },
          ],
        } as VisionAnnotationRegion,
        type: 'points' as RegionType,
        source: 'user' as AnnotationSourceV1,
        status: AnnotationStatus.Unhandled,
        data: {
          keypoint: true,
        },
      };

      const generateDummyAnnotations = (fileId?: number) => {
        return AnnotationUtilsV1.createVisionAnnotationStubV1(
          payload.id,
          payload.text,
          payload.modelType,
          fileId || payload.fileId,
          payload.createdTime,
          payload.lastUpdatedTime,
          payload.region,
          payload.type,
          payload.source,
          payload.status,
          payload.data
        );
      };

      test('Should not update state when annotations are from multiple files', () => {
        [
          CreateAnnotationsV1.fulfilled.type,
          VisionJobUpdate.fulfilled.type,
          UpdateAnnotationsV1.fulfilled.type,
          RetrieveAnnotationsV1.fulfilled.type,
        ].forEach((type) => {
          const action = {
            type,
            payload: [
              // annotations from different files
              generateDummyAnnotations(10),
              generateDummyAnnotations(20),
            ],
          };

          expect(reducer(initialState, action)).toEqual(initialState);
        });
      });

      test('Should populate keypoint collection related fields in state', () => {
        [
          CreateAnnotationsV1.fulfilled.type,
          VisionJobUpdate.fulfilled.type,
          UpdateAnnotationsV1.fulfilled.type,
          RetrieveAnnotationsV1.fulfilled.type,
        ].forEach((type) => {
          const action = { type, payload: [generateDummyAnnotations()] };

          expect(reducer(initialState, action)).toEqual({
            ...initialState,
            collections: {
              byId: {
                [payload.id.toString()]: {
                  ...dummyKeypointCollectionState(payload.id.toString(), [
                    (payload.region.vertices[0] as KeypointVertex).id,
                  ]),
                },
              },
              allIds: [payload.id.toString()],
              selectedIds: [],
            },
            keypointMap: {
              byId: {
                [(payload.region.vertices[0] as KeypointVertex).id]: {
                  id: (payload.region.vertices[0] as KeypointVertex).id,
                  selected: (payload.region.vertices[0] as KeypointVertex)
                    .selected,
                  x: payload.region.vertices[0].x,
                  y: payload.region.vertices[0].y,
                  caption: (payload.region.vertices[0] as KeypointVertex)
                    .caption,
                  color: (payload.region.vertices[0] as KeypointVertex).color,
                  order: (payload.region.vertices[0] as KeypointVertex).order,
                },
              },
              allIds: [(payload.region.vertices[0] as KeypointVertex).id],
              selectedIds: [],
            },
          });
        });
      });
    });
  });
});
