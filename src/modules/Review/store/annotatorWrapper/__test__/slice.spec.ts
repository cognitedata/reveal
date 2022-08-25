import {
  getDummyKeypointCollectionState,
  getDummyKeypointState,
} from 'src/__test-utils/annotations';
import { Status } from 'src/api/annotation/types';
import { getDummyRegionOriginatedInAnnotator } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/__test-utils/region';
import { tools } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/Tools';
import {
  AnnotatorNewRegion,
  AnnotatorPointRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import reducer, {
  createTempKeypointCollection,
  deleteTempKeypointCollection,
  initialState,
  keypointSelectStatusChange,
  onCreateRegion,
  onUpdateRegion,
  selectCollection,
  setCollectionStatus,
  setLastCollectionName,
  setLastShape,
  setSelectedTool,
  toggleCollectionVisibility,
} from 'src/modules/Review/store/annotatorWrapper/slice';
import {
  AnnotatorWrapperState,
  KeypointCollectionState,
} from 'src/modules/Review/store/annotatorWrapper/type';
import { PredefinedKeypoint, PredefinedShape } from 'src/modules/Review/types';

jest.mock('src/modules/Common/Utils/AnnotationUtils/AnnotationUtils', () => ({
  ...jest.requireActual(
    'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils'
  ),
  createUniqueNumericId: () => {
    return 1234;
  },
}));

describe('Test annotator slice', () => {
  test('reducer should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('Test reducers', () => {
    const gaugeKeypoints: PredefinedKeypoint[] = [
      {
        caption: 'left',
        order: '1',
        color: 'red',
      },
      {
        caption: 'center',
        order: '2',
        color: 'red',
      },
      {
        caption: 'right',
        order: '3',
        color: 'red',
      },
    ];
    const valveKeypoints: PredefinedKeypoint[] = [
      {
        caption: 'up',
        order: '1',
        color: 'green',
      },
      {
        caption: 'down',
        order: '2',
        color: 'green',
      },
    ];
    const predefinedKeypointCollectionList = [
      {
        id: '1',
        collectionName: 'gauge',
        keypoints: gaugeKeypoints,
        color: 'red',
      },
      {
        id: '2',
        collectionName: 'valve',
        keypoints: valveKeypoints,
        color: 'green',
      },
    ];

    const predefinedShapesList: PredefinedShape[] = [
      {
        shapeName: 'box',
        color: 'red',
      },
      {
        shapeName: 'motor',
        color: 'green',
      },
    ];

    const modifiedInitialState = {
      ...initialState,
      isCreatingKeypointCollection: false,
      predefinedAnnotations: {
        predefinedKeypointCollections: predefinedKeypointCollectionList,
        predefinedShapes: predefinedShapesList,
      },
      collections: {
        byId: {
          1: getDummyKeypointCollectionState({
            id: 1,
            label: 'valve',
            keypointIds: ['V1', 'V2'],
          }),
        },
        allIds: [1],
        selectedIds: [1],
      },
      lastCollectionId: 1,
      lastCollectionName: 'valve',
      lastShape: 'motor',
      keypointMap: {
        byId: {
          V1: getDummyKeypointState('up'),
          V2: getDummyKeypointState('down'),
        },
        allIds: ['V1', 'V2'],
        selectedIds: ['V2'],
      },
    };

    const modifiedInitialStateDuringKeypointCreation = {
      ...initialState,
      isCreatingKeypointCollection: true,
      predefinedAnnotations: {
        predefinedKeypointCollections: predefinedKeypointCollectionList,
        predefinedShapes: predefinedShapesList,
      },
      collections: {
        byId: {
          1: getDummyKeypointCollectionState({
            id: 1,
            label: 'valve',
            keypointIds: ['V1', 'V2'],
          }),
          2: getDummyKeypointCollectionState({
            id: 2,
            label: 'gauge',
            keypointIds: ['K1', 'k2'],
          }),
        },
        allIds: [1, 2],
        selectedIds: [2],
      },
      lastCollectionId: 2,
      lastCollectionName: 'gauge',
      lastShape: 'motor',
      keypointMap: {
        byId: {
          V1: getDummyKeypointState('up'),
          V2: getDummyKeypointState('down'),
          k1: getDummyKeypointState('left'),
          k2: getDummyKeypointState('right'),
        },
        allIds: ['V1', 'V2', 'k1', 'k2'],
        selectedIds: ['k1'],
      },
    };

    describe('Test selectCollection reducer', () => {
      test('if collection is already selected should deselect', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        expect(
          reducer(previousState, selectCollection(2)).collections.selectedIds
        ).toStrictEqual([]);
      });

      test('should deselect only provided collection', () => {
        const previousState = {
          ...modifiedInitialState,
          collections: {
            ...modifiedInitialState.collections,
            selectedIds: [1, 2],
          },
        };

        expect(
          reducer(previousState, selectCollection(2)).collections.selectedIds
        ).toEqual([1]);
      });
      test('should select only provided collection', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        expect(
          reducer(previousState, selectCollection(1)).collections.selectedIds
        ).toEqual([1]);
      });
      test('should not select invalid collection', () => {
        const previousState = {
          ...modifiedInitialState,
        };

        expect(
          reducer(previousState, selectCollection(3)).collections.selectedIds
        ).toEqual([1]);
      });
    });

    describe('Test toggleCollectionVisibility reducer', () => {
      const previousState = {
        ...modifiedInitialState,
        collections: {
          ...modifiedInitialState.collections,
          byId: {
            ...modifiedInitialState.collections.byId,
            2: getDummyKeypointCollectionState({
              id: 2,
              keypointIds: ['k2'],
              show: false,
              status: Status.Rejected,
            }),
          },
        },
      };

      test('should hide visible collection', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility(1)).collections
            .byId[1].show
        ).toEqual(false);
        expect(
          reducer(previousState, toggleCollectionVisibility(1)).collections
            .byId[2].show
        ).toEqual(false);
      });

      test('should make visible hidden collection', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility(2)).collections
            .byId[2].show
        ).toEqual(true);
        expect(
          reducer(previousState, toggleCollectionVisibility(2)).collections
            .byId[1].show
        ).toEqual(true);
      });

      test('should not effect others when non existing id used', () => {
        expect(
          reducer(previousState, toggleCollectionVisibility(3)).collections
            .byId[1].show
        ).toEqual(true);
        expect(
          reducer(previousState, toggleCollectionVisibility(3)).collections
            .byId[2].show
        ).toEqual(false);
      });
    });

    describe('Test setCollectionStatus reducer', () => {
      const previousState = {
        ...modifiedInitialState,
        collections: {
          ...modifiedInitialState.collections,
          byId: {
            ...modifiedInitialState.collections.byId,
            2: getDummyKeypointCollectionState({
              id: 2,
              keypointIds: ['k2'],
              show: false,
              status: Status.Rejected,
            }),
          },
        },
      };

      test('should set collection status', () => {
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 1, status: Status.Rejected })
          ).collections.byId[1].status
        ).toEqual(Status.Rejected);
        expect(
          reducer(
            previousState,
            setCollectionStatus({ id: 2, status: Status.Approved })
          ).collections.byId[2].status
        ).toEqual(Status.Approved);
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
      const previousState: AnnotatorWrapperState = {
        ...modifiedInitialState,
      };

      test('deselect selected keypoint', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('V2')).keypointMap
            .selectedIds
        ).toEqual([]);
      });

      test("deselecting doesn't affect selected collection", () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('V2')).collections
            .selectedIds
        ).toStrictEqual(previousState.collections.selectedIds);
      });

      test('select non-selected keypoint (for collection with id 2)', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('V1')).keypointMap
            .selectedIds
        ).toEqual(['V1']);
      });

      test('nothing changed for invalid keypoint id', () => {
        expect(
          reducer(previousState, keypointSelectStatusChange('k3')).keypointMap
            .selectedIds
        ).toEqual(['V2']);
      });
    });

    describe('Test setLastShape reducer', () => {
      test('value in state should be equal to provided value', () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'box';

        expect(
          reducer(previousState, setLastShape(actionPayload)).lastShape
        ).toEqual(actionPayload);
      });
      test('providing same last shape', () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'motor';

        expect(
          reducer(previousState, setLastShape(actionPayload)).lastShape
        ).toEqual(actionPayload);
      });
      test("invalid shape name doesn't affect state", () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'window'; // not one of predefined shapes

        expect(
          reducer(previousState, setLastShape(actionPayload)).lastShape
        ).toEqual(previousState.lastShape);
      });
    });

    describe('Test setLastCollectionName reducer', () => {
      test('value in state should be equal to provided value', () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'valve';

        expect(
          reducer(previousState, setLastCollectionName(actionPayload))
            .lastCollectionName
        ).toEqual(actionPayload);
      });

      test('providing same last collection name', () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'gauge';

        expect(
          reducer(previousState, setLastCollectionName(actionPayload))
            .lastCollectionName
        ).toEqual(actionPayload);
      });

      test('providing invalid collection name', () => {
        const consoleSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'wheel';

        expect(
          reducer(previousState, setLastCollectionName(actionPayload))
            .lastCollectionName
        ).toEqual(previousState.lastCollectionName);
        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    describe('Test setSelectedTool reducer', () => {
      test('value in state should be equal to provided value, and should be one of the tools', () => {
        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = tools.PAN_TOOL;

        expect(
          reducer(previousState, setSelectedTool(actionPayload)).currentTool
        ).toEqual(actionPayload);
      });
      test('providing invalid tool', () => {
        const consoleSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const previousState = {
          ...modifiedInitialState,
        };
        const actionPayload = 'invalid-tool';

        expect(
          reducer(previousState, setSelectedTool(actionPayload)).currentTool
        ).toEqual(previousState.currentTool);
        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    describe('Test deleteTempKeypointCollection reducer', () => {
      test('if currentCollection id is not available', () => {
        const previousState = {
          ...initialState,
        };

        expect(
          reducer(previousState, deleteTempKeypointCollection())
            .lastCollectionId
        ).toBeUndefined();
        expect(
          reducer(previousState, deleteTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(false);
      });
      test('if currentCollection id is available', () => {
        const previousState = {
          ...modifiedInitialState,
        } as AnnotatorWrapperState;
        const currentCollectionKeypointIds =
          previousState.collections.byId[previousState.lastCollectionId || 2]
            .keypointIds;

        expect(
          reducer(previousState, deleteTempKeypointCollection())
            .lastCollectionId
        ).toBeUndefined();
        expect(
          reducer(previousState, deleteTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(false);
        expect(
          reducer(previousState, deleteTempKeypointCollection()).collections
            .byId[previousState.lastCollectionId || 2]
        ).toBeUndefined();
        expect(
          reducer(previousState, deleteTempKeypointCollection()).collections
            .byId[previousState.lastCollectionId || 2]
        ).toBeUndefined();
        expect(
          reducer(previousState, deleteTempKeypointCollection()).collections
            .selectedIds
        ).not.toContain(previousState.lastCollectionId || 2);
        expect(
          reducer(previousState, deleteTempKeypointCollection()).collections
            .allIds
        ).not.toContain(previousState.lastCollectionId || 2);
        // eslint-disable-next-line no-restricted-syntax
        for (const keypointId of currentCollectionKeypointIds) {
          expect(
            reducer(previousState, deleteTempKeypointCollection()).keypointMap
              .byId[keypointId]
          ).toBeUndefined();
          expect(
            reducer(previousState, deleteTempKeypointCollection()).keypointMap
              .selectedIds
          ).not.toContain(keypointId);
          expect(
            reducer(previousState, deleteTempKeypointCollection()).keypointMap
              .allIds
          ).not.toContain(keypointId);
        }
      });
    });

    describe('Test createTempKeypointCollection reducer', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      test('when temp region is not available', () => {
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: predefinedKeypointCollectionList,
            predefinedShapes: predefinedShapesList,
          },
        };

        expect(
          reducer(previousState, createTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(false);
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when temp region is available, but missing properties', () => {
        const previousStateWithEmptyTempRegion = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: predefinedKeypointCollectionList,
            predefinedShapes: predefinedShapesList,
          },
          temporaryRegion: {} as AnnotatorPointRegion,
        };

        const previousStateWithTempRegionWithFewProps = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: predefinedKeypointCollectionList,
            predefinedShapes: predefinedShapesList,
          },
          temporaryRegion: {
            id: 1,
            type: AnnotatorRegionType.PointRegion,
            x: 0.5,
            y: 0.5,
          } as AnnotatorPointRegion,
        };

        expect(
          reducer(
            previousStateWithEmptyTempRegion,
            createTempKeypointCollection()
          ).isCreatingKeypointCollection
        ).toEqual(false);
        expect(consoleSpy).toHaveBeenCalled();
        expect(
          reducer(
            previousStateWithTempRegionWithFewProps,
            createTempKeypointCollection()
          ).isCreatingKeypointCollection
        ).toEqual(false);
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when temp region is available but predefined keypoint collection does not exist', () => {
        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: predefinedKeypointCollectionList,
            predefinedShapes: predefinedShapesList,
          },
          temporaryRegion: getDummyRegionOriginatedInAnnotator({
            id: 1,
            annotationLabelOrText: 'meter',
            type: AnnotatorRegionType.PointRegion,
            x: 0.5,
            y: 0.5,
            keypointLabel: 'start',
            keypointConfidence: 1,
            color: 'red',
            parentAnnotationId: 0,
          }),
        };

        expect(
          reducer(previousState, createTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(false);
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when temp region is available but existing predefined keypoint collection does not contain keypoints', () => {
        const collectionName = 'blank-collection';

        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: [
              ...predefinedKeypointCollectionList,
              {
                id: 3,
                collectionName,
                color: 'red',
                keypoints: [],
              },
            ],
            predefinedShapes: predefinedShapesList,
          },
          temporaryRegion: getDummyRegionOriginatedInAnnotator({
            id: 1,
            annotationLabelOrText: collectionName,
            type: AnnotatorRegionType.PointRegion,
            x: 0.5,
            y: 0.5,
            keypointLabel: 'up',
            keypointConfidence: 1,
            color: 'red',
            parentAnnotationId: 0,
          }),
        };

        expect(
          reducer(previousState, createTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(false);
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when temp region is available, also predefined keypoint collection for the collection also exist', () => {
        const collectionName = 'valve';

        const previousState = {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections: predefinedKeypointCollectionList,
            predefinedShapes: predefinedShapesList,
          },
          temporaryRegion: getDummyRegionOriginatedInAnnotator({
            id: 1,
            annotationLabelOrText: collectionName,
            type: AnnotatorRegionType.PointRegion,
            x: 0.5,
            y: 0.5,
            keypointLabel: 'up',
            keypointConfidence: 1,
            color: 'red',
            parentAnnotationId: 0,
          }),
        };

        const predefinedCollection =
          previousState.predefinedAnnotations.predefinedKeypointCollections.find(
            (collection) => collection.collectionName === collectionName
          );

        expect(
          reducer(previousState, createTempKeypointCollection())
            .isCreatingKeypointCollection
        ).toEqual(true);
        expect(
          reducer(previousState, createTempKeypointCollection())
            .lastCollectionId
        ).toEqual(1234);
        expect(
          reducer(previousState, createTempKeypointCollection())
            .lastCollectionName
        ).toEqual(collectionName);
        expect(
          reducer(previousState, createTempKeypointCollection()).collections
            .byId[1234]
        ).toStrictEqual({
          id: 1234,
          keypointIds: [String(1)],
          label: collectionName,
          status: Status.Approved,
          show: true,
        } as KeypointCollectionState);
        expect(
          reducer(previousState, createTempKeypointCollection()).collections
            .allIds
        ).toEqual([1234]);
        expect(
          reducer(previousState, createTempKeypointCollection()).collections
            .selectedIds
        ).toEqual([1234]);
        expect(
          reducer(previousState, createTempKeypointCollection()).lastKeyPoint
        ).toEqual(predefinedCollection!.keypoints[0].caption);
      });
    });

    describe('Test onCreateRegion reducer', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const collectionName = 'valve';

      const tempRegionWithLabels = getDummyRegionOriginatedInAnnotator({
        id: 1,
        annotationLabelOrText: collectionName,
        type: AnnotatorRegionType.PointRegion,
        x: 0.5,
        y: 0.5,
        keypointLabel: 'up',
        keypointConfidence: 1,
        color: 'red',
        parentAnnotationId: 0,
      });

      test('when isCreatingKeypointCollection is false', () => {
        const previousState = {
          ...modifiedInitialState,
        };

        expect(
          reducer(
            previousState,
            onCreateRegion(tempRegionWithLabels as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when lastCollectionId is undefined', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          lastCollectionId: undefined,
        };

        expect(
          reducer(
            previousState,
            onCreateRegion(tempRegionWithLabels as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when provided region is not a point region', () => {
        const tempBoxRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'Box',
          type: AnnotatorRegionType.BoxRegion,
          x: 0.5,
          y: 0.5,
          h: 1,
          w: 1,
          color: 'red',
        });

        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        expect(
          reducer(
            previousState,
            onCreateRegion(tempBoxRegion as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when provided region is empty', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        expect(
          reducer(previousState, onCreateRegion({} as AnnotatorPointRegion))
            .keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when annotationLabel, keypoint label or keypoint data not available', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        const tempRegionWithoutLabel = {
          id: 1,
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
        };

        expect(
          reducer(
            previousState,
            onCreateRegion(tempRegionWithoutLabel as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithoutLabel.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
        expect(
          reducer(
            previousState,
            onCreateRegion({
              ...tempRegionWithLabels,
              x: NaN,
              y: NaN,
            } as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithoutLabel.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when temp keypoint collection exist but region is of invalid keypoint collection', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        const newRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'invalid-collection-name',
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
          keypointLabel: 'up',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        expect(
          reducer(previousState, onCreateRegion(newRegion)).keypointMap.byId[
            newRegion.id
          ]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when temp keypoint collection exist but region keypoint label is invalid', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        const newRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'valve',
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
          keypointLabel: 'up',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        expect(
          reducer(previousState, onCreateRegion(newRegion)).keypointMap.byId[
            newRegion.id
          ]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when temp keypoint collection exist but region is already created', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
        };

        const newRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'valve',
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
          keypointLabel: 'one',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        expect(
          reducer(previousState, onCreateRegion(newRegion)).keypointMap.byId[
            newRegion.id
          ]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    const isSameAsTempRegionOnUpdateKeypointRegion = (
      previousState: AnnotatorWrapperState,
      updatedRegion: AnnotatorPointRegion
    ) => {
      expect(
        reducer(previousState, onUpdateRegion(updatedRegion)).temporaryRegion
      ).toStrictEqual(
        expect.objectContaining({
          x: (updatedRegion as AnnotatorPointRegion).x,
          y: (updatedRegion as AnnotatorPointRegion).y,
          annotationLabelOrText: updatedRegion.annotationLabelOrText,
          keypointLabel: (updatedRegion as AnnotatorPointRegion).keypointLabel,
          keypointConfidence: (updatedRegion as AnnotatorPointRegion)
            .keypointConfidence,
          color: (updatedRegion as AnnotatorPointRegion).color,
        } as AnnotatorPointRegion)
      );
    };

    describe('Test onUpdateKeypointRegion reducer', () => {
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const collectionName = 'valve';

      const tempRegionWithoutLabel = {
        id: 1,
        type: AnnotatorRegionType.PointRegion,
        x: 0.5,
        y: 0.5,
      } as AnnotatorNewRegion;

      const tempRegionWithLabels = getDummyRegionOriginatedInAnnotator({
        id: 1,
        annotationLabelOrText: collectionName,
        type: AnnotatorRegionType.PointRegion,
        x: 0.6,
        y: 0.8,
        keypointLabel: 'up',
        keypointConfidence: 1,
        color: 'red',
        parentAnnotationId: 0,
      });

      test('when provided region is empty', () => {
        const previousState: AnnotatorWrapperState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        expect(
          reducer(previousState, onUpdateRegion({} as AnnotatorPointRegion))
            .temporaryRegion
        ).toStrictEqual(tempRegionWithoutLabel);
        expect(
          reducer(previousState, onUpdateRegion({} as AnnotatorPointRegion))
            .keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when tempRegion id is same as updated region id', () => {
        const previousState: AnnotatorWrapperState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          tempRegionWithLabels as AnnotatorPointRegion
        );
      });

      test('when updated region exists as a keypoint in keypoint map', () => {
        const previousState: AnnotatorWrapperState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: {
            ...tempRegionWithoutLabel,
            id: 2,
          },
        };

        const updatedRegionOfKeypoint = getDummyRegionOriginatedInAnnotator({
          id: 'V1',
          annotationLabelOrText: 'valve',
          type: AnnotatorRegionType.PointRegion,
          x: 0.7,
          y: 0.8,
          keypointLabel: 'up',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        }) as AnnotatorPointRegion;

        expect(
          reducer(previousState, onUpdateRegion(updatedRegionOfKeypoint))
            .keypointMap.byId[updatedRegionOfKeypoint.id]
        ).toStrictEqual(
          expect.objectContaining({
            point: expect.objectContaining({
              x: updatedRegionOfKeypoint.x,
              y: updatedRegionOfKeypoint.y,
            }),
            label: updatedRegionOfKeypoint.keypointLabel,
            confidence: updatedRegionOfKeypoint.keypointConfidence,
          })
        );
      });

      test('when updated region is invalid - invalid keypoint id and collection name', () => {
        const previousState: AnnotatorWrapperState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        expect(
          reducer(
            previousState,
            onUpdateRegion({
              ...tempRegionWithLabels,
              id: 'S1',
              annotationLabelOrText: 'invalid-collection-name',
            })
          ).temporaryRegion
        ).toStrictEqual(tempRegionWithoutLabel);

        expect(
          reducer(previousState, onUpdateRegion(tempRegionWithoutLabel))
            .keypointMap.byId[tempRegionWithoutLabel.id]
        ).toBeUndefined();

        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when temp region is not a point region', () => {
        const tempBoxRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'Box',
          type: AnnotatorRegionType.BoxRegion,
          x: 0.5,
          y: 0.5,
          h: 1,
          w: 1,
          color: 'red',
        });

        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        expect(
          reducer(
            previousState,
            onUpdateRegion(tempBoxRegion as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
        expect(
          reducer(previousState, onUpdateRegion(tempBoxRegion)).temporaryRegion
        ).toStrictEqual(tempRegionWithoutLabel);
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when isCreatingKeypointCollection is false', () => {
        const previousState: AnnotatorWrapperState = {
          ...modifiedInitialState,
          temporaryRegion: tempRegionWithoutLabel,
        };

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          tempRegionWithLabels as AnnotatorPointRegion
        );

        expect(
          reducer(
            previousState,
            onUpdateRegion(tempRegionWithLabels as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
      });
      test('when lastCollectionId is undefined', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          lastCollectionId: undefined,
          temporaryRegion: tempRegionWithoutLabel,
        };

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          tempRegionWithLabels as AnnotatorPointRegion
        );

        expect(
          reducer(
            previousState,
            onUpdateRegion(tempRegionWithLabels as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithLabels.id]
        ).toBeUndefined();
      });

      test('when annotationLabel, keypoint label or keypoint data not available', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          tempRegionWithLabels as AnnotatorPointRegion
        );

        expect(
          reducer(
            previousState,
            onUpdateRegion(tempRegionWithoutLabel as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithoutLabel.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
        expect(
          reducer(
            previousState,
            onUpdateRegion({
              ...tempRegionWithLabels,
              x: NaN,
              y: NaN,
            } as AnnotatorPointRegion)
          ).keypointMap.byId[tempRegionWithoutLabel.id]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });

      test('when temp keypoint collection exist but region keypoint label is invalid', () => {
        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: tempRegionWithoutLabel,
        };

        const newRegion = getDummyRegionOriginatedInAnnotator({
          id: 1,
          annotationLabelOrText: 'valve',
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
          keypointLabel: 'up',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          newRegion as AnnotatorPointRegion
        );

        expect(
          reducer(previousState, onUpdateRegion(newRegion)).keypointMap.byId[
            newRegion.id
          ]
        ).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalled();
      });
      test('when temp keypoint collection exist but region is already created', () => {
        const createdRegion = getDummyRegionOriginatedInAnnotator({
          id: 'k2',
          annotationLabelOrText: 'gauge',
          type: AnnotatorRegionType.PointRegion,
          x: 0.5,
          y: 0.5,
          keypointLabel: 'right',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        const previousState = {
          ...modifiedInitialStateDuringKeypointCreation,
          temporaryRegion: createdRegion,
        };

        const updatedRegion = getDummyRegionOriginatedInAnnotator({
          id: 'k2',
          annotationLabelOrText: 'gauge',
          type: AnnotatorRegionType.PointRegion,
          x: 0.1,
          y: 0.7,
          keypointLabel: 'right',
          keypointConfidence: 1,
          color: 'red',
          parentAnnotationId: 0,
        });

        isSameAsTempRegionOnUpdateKeypointRegion(
          previousState,
          updatedRegion as AnnotatorPointRegion
        );
        expect(
          reducer(previousState, onUpdateRegion(updatedRegion)).keypointMap
            .byId[updatedRegion.id]
        ).toStrictEqual(
          expect.objectContaining({
            point: expect.objectContaining({
              x: (updatedRegion as AnnotatorPointRegion).x,
              y: (updatedRegion as AnnotatorPointRegion).y,
            }),
            label: (updatedRegion as AnnotatorPointRegion).keypointLabel,
            confidence: (updatedRegion as AnnotatorPointRegion)
              .keypointConfidence,
          })
        );
      });
    });
  });

  describe.skip('Test extraReducers', () => {
    // ToDo: add tests for extraReducers after thunks were migrated to V2 types
  });
});
