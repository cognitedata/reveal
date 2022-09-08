/* eslint-disable jest/no-disabled-tests */
import { initialState } from 'src/modules/Review/store/annotatorWrapper/slice';
import { getInitialState } from 'src/__test-utils/store.utils';
import { CombinedState } from '@reduxjs/toolkit';
import { RootState } from 'src/store/rootReducer';
import { ReviewState } from 'src/modules/Review/store/review/types';
import {
  AnnotatorWrapperState,
  KeypointCollectionState,
  KeypointState,
} from 'src/modules/Review/store/annotatorWrapper/type';
import {
  PredefinedKeypointCollection,
  ReviewKeypoint,
} from 'src/modules/Review/types';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  getDummyPredefinedKeypoint,
  getDummyKeypointCollectionState,
  getDummyKeypointState,
  getDummyPredefinedKeypointCollection,
  getDummyTempKeypointCollection,
  getDummyKeypoint,
} from 'src/__test-utils/annotations';
import {
  selectNextPredefinedKeypointCollection,
  selectNextPredefinedShape,
  selectTempKeypointCollection,
} from 'src/modules/Review/store/annotatorWrapper/selectors';

describe('Test annotationLabel selectors', () => {
  // todo add correct
  describe.skip('Test selectNextPredefinedShape selector', () => {
    test('Should return last shape', () => {
      const lastShape = 'person';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          lastShape,
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedShape(previousState)).toEqual(lastShape);
    });

    test('Should return text from annotation settings', () => {
      const annotationSettingsNewLabel = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {
              text: annotationSettingsNewLabel,
            },
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedShape(previousState)).toEqual(
        annotationSettingsNewLabel
      );
    });

    test('Should return name of first predefined shape', () => {
      const shapeName = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypointCollections:
              initialState.predefinedAnnotations.predefinedKeypointCollections,
            predefinedShapes: [
              {
                shapeName,
                color: 'red',
              },
            ],
          },
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedShape(previousState)).toEqual(shapeName);
    });

    test('Should return empty string', () => {
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedShape(previousState)).toEqual('');
    });

    test('Should return text from annotation settings when both createNew obj and last shape is available', () => {
      const annotationSettingsNewLabel = 'gauge';
      const lastShape = 'person';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {
              text: annotationSettingsNewLabel,
            },
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          lastShape,
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedShape(previousState)).toEqual(
        annotationSettingsNewLabel
      );
    });
  });

  describe('Test selectNextPredefinedKeypointCollection selector', () => {
    const predefinedKeypointCollectionList: PredefinedKeypointCollection[] = [
      {
        id: '1',
        collectionName: 'gauge',
        keypoints: [],
        color: 'red',
      },
      {
        id: '2',
        collectionName: 'valve',
        keypoints: [],
        color: 'yellow',
      },
    ];

    test('Should return first predefinedKeypointCollections', () => {
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypointCollections: predefinedKeypointCollectionList,
          },
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedKeypointCollection(previousState)).toEqual(
        predefinedKeypointCollectionList[0]
      );
    });

    test('Should return matching predefinedKeypointCollection', () => {
      const annotationSettingsNewLabel = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {
              text: annotationSettingsNewLabel,
              color: 'red',
            },
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypointCollections: predefinedKeypointCollectionList,
          },
        },
      } as CombinedState<RootState>;

      const predefinedKeypointCollection =
        predefinedKeypointCollectionList.find(
          (item) => item.collectionName === annotationSettingsNewLabel
        );

      expect(
        selectNextPredefinedKeypointCollection(previousState)
      ).toStrictEqual({
        collectionName: predefinedKeypointCollection!.collectionName,
        color: predefinedKeypointCollection!.color,
      });
    });

    test('Should return matching predefinedKeypointCollection (lastCollectionName)', () => {
      const lastCollectionName = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewState>,
        annotatorWrapperReducer: {
          ...initialState,
          lastCollectionName,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypointCollections: predefinedKeypointCollectionList,
          },
        },
      } as CombinedState<RootState>;
      expect(selectNextPredefinedKeypointCollection(previousState)).toEqual(
        predefinedKeypointCollectionList.find(
          (item) => item.collectionName === lastCollectionName
        )
      );
    });
  });

  describe('Test selectTempKeypointCollection selector', () => {
    const predefinedKeypointCollection: PredefinedKeypointCollection =
      getDummyPredefinedKeypointCollection(123);

    const k1Id = generateKeypointId(10, 'left');
    const k2Id = generateKeypointId(10, 'center');
    const k3Id = generateKeypointId(20, 'right');
    const k4Id = generateKeypointId(20, 'left');

    const unfinishedCollection = getDummyKeypointCollectionState({
      id: 20,
      keypointIds: [k4Id],
    });

    const keypointCollectionState: Record<string, KeypointCollectionState> = {
      10: getDummyKeypointCollectionState({
        id: 10,
        keypointIds: [k1Id, k2Id, k3Id],
      }),
      20: unfinishedCollection,
    };

    const imageKeypoints: Record<string, KeypointState> = {
      [k1Id]: getDummyKeypointState('left'),
      [k2Id]: getDummyKeypointState('center'),
      [k3Id]: getDummyKeypointState('right'),
      [k4Id]: getDummyKeypointState('left'),
    };

    test('Should return null since lastCollectionId is not set', () => {
      const previousState = {
        ...initialState,
      };
      expect(
        selectTempKeypointCollection(previousState, {
          currentFileId: 1,
          annotationColorMap: { gauge: 'red' },
        })
      ).toEqual(null);
    });

    test('Should return last collection++', () => {
      const lastCollectionId = 20;
      const collections = {
        byId: keypointCollectionState,
        allIds: [10, 20],
        selectedIds: [],
      };

      const previousState: AnnotatorWrapperState = {
        ...initialState,
        lastCollectionId,
        collections,
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypointCollections: [predefinedKeypointCollection],
        },
        keypointMap: {
          byId: imageKeypoints,
          allIds: Object.keys(imageKeypoints),
          selectedIds: [],
        },
      };

      const keypoints: ReviewKeypoint[] = [
        {
          id: '20-left',
          selected: false,
          keypoint: getDummyKeypoint(),
          label: 'left',
        },
      ];

      const dummyTempCollection = getDummyTempKeypointCollection({
        id: 20,
        label: 'gauge',
        reviewKeypoints: keypoints,
        remainingKeypoints: [
          getDummyPredefinedKeypoint('center'),
          getDummyPredefinedKeypoint('right'),
        ],
      });

      expect(
        selectTempKeypointCollection(previousState, {
          currentFileId: 1,
          annotationColorMap: { gauge: 'red' },
        })
      ).toStrictEqual(dummyTempCollection);
    });
  });
});
