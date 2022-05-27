/* eslint-disable jest/no-disabled-tests */
import { initialState } from 'src/modules/Review/store/annotatorWrapper/slice';
import {
  nextKeypoint,
  nextShape,
  nextCollection,
  currentCollection,
  keypointsCompleteInCollection,
} from 'src/modules/Review/store/annotatorWrapper/selectors';
import { getInitialState } from 'src/__test-utils/store.utils';
import { CombinedState } from '@reduxjs/toolkit';
import { RootState } from 'src/store/rootReducer';
import { ReviewReducerState } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotatorWrapperState,
  KeypointCollectionState,
} from 'src/modules/Review/store/annotatorWrapper/type';
import { KeypointCollection } from 'src/modules/Review/types';
import { Keypoint } from 'src/api/annotation/types';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  dummyKeypoint,
  getDummyKeypointCollectionState,
  getDummyKeypointState,
  getDummyPredefinedKeypoint,
} from 'src/__test-utils/annotations';
import { ReviewKeypoint } from 'src/modules/Review/store/review/types';

describe('Test annotationLabel selectors', () => {
  describe('Test nextKeypoint selector', () => {
    test('Should return null since no predefined collections exists', () => {
      const previousState = {
        ...initialState,
      };
      expect(nextKeypoint(previousState)).toEqual(null);
    });

    test('Should return first point in predefined collection since lastKeyPoint is not set', () => {
      const predefinedKeypointCollection: KeypointCollection =
        getDummyPredefinedKeypoint('123');

      const previousState: AnnotatorWrapperState = {
        ...initialState,
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypointCollections: [predefinedKeypointCollection],
        },
      };
      expect(nextKeypoint(previousState)).toEqual(dummyKeypoint('left'));
    });

    test('Should return next point in predefined collection since lastKeyPoint is set', () => {
      const predefinedKeypointCollection: KeypointCollection =
        getDummyPredefinedKeypoint('123');

      const k1Id = generateKeypointId('10', 'left');
      const k2Id = generateKeypointId('10', 'center');

      const keypointCollectionState: Record<string, KeypointCollectionState> = {
        '10': getDummyKeypointCollectionState('10', [k1Id, k2Id]),
      };

      const imageKeypoints: Record<string, Keypoint> = {
        [k1Id]: getDummyKeypointState('left'),
        [k2Id]: getDummyKeypointState('center'),
      };
      const collections = {
        byId: keypointCollectionState,
        allIds: ['10'],
        selectedIds: [],
      };
      const previousState: AnnotatorWrapperState = {
        ...initialState,
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
        lastCollectionName: 'gauge',
        lastKeyPoint: 'center',
      };
      expect(nextKeypoint(previousState)).toEqual(dummyKeypoint('right'));
    });

    test('Should return first point in predefined collection since lastKeyPoint is set to last keypoint in predefined collection', () => {
      const predefinedKeypointCollection: KeypointCollection =
        getDummyPredefinedKeypoint('123');

      const k1Id = generateKeypointId('10', 'left');
      const k2Id = generateKeypointId('10', 'center');
      const k3Id = generateKeypointId('10', 'right');

      const keypointCollectionState: Record<string, KeypointCollectionState> = {
        '10': getDummyKeypointCollectionState('10', [k1Id, k2Id, k3Id]),
      };

      const imageKeypoints: Record<string, Keypoint> = {
        [k1Id]: getDummyKeypointState('left'),
        [k2Id]: getDummyKeypointState('center'),
        [k3Id]: getDummyKeypointState('right'),
      };
      const collections = {
        byId: keypointCollectionState,
        allIds: ['10'],
        selectedIds: [],
      };

      const previousState: AnnotatorWrapperState = {
        ...initialState,
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
        lastCollectionName: 'gauge',
        lastKeyPoint: 'right',
      };

      expect(nextKeypoint(previousState)).toEqual(dummyKeypoint('left'));
    });

    test('Should return first point in predefined collection for invalid last keypoint label', () => {
      const predefinedKeypointCollection: KeypointCollection =
        getDummyPredefinedKeypoint('123');

      const k1Id = generateKeypointId('10', 'left');
      const k2Id = generateKeypointId('10', 'center');
      const k3Id = generateKeypointId('10', 'right');

      const keypointCollectionState: Record<string, KeypointCollectionState> = {
        '10': getDummyKeypointCollectionState('10', [k1Id, k2Id, k3Id]),
      };

      const imageKeypoints: Record<string, Keypoint> = {
        [k1Id]: getDummyKeypointState('left'),
        [k2Id]: getDummyKeypointState('center'),
        [k3Id]: getDummyKeypointState('right'),
      };
      const collections = {
        byId: keypointCollectionState,
        allIds: ['10'],
        selectedIds: [],
      };

      const previousState: AnnotatorWrapperState = {
        ...initialState,
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
        lastCollectionName: 'gauge',
        lastKeyPoint: 'invalid-label',
      };

      expect(nextKeypoint(previousState)).toEqual(dummyKeypoint('left'));
    });
  });

  describe('Test nextShape selector', () => {
    test('Should return last shape', () => {
      const lastShape = 'person';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
          lastShape,
        },
      } as CombinedState<RootState>;
      expect(nextShape(previousState)).toEqual(lastShape);
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
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
        },
      } as CombinedState<RootState>;
      expect(nextShape(previousState)).toEqual(annotationSettingsNewLabel);
    });

    test('Should return name of first predefined shape', () => {
      const shapeName = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewReducerState>,
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
      expect(nextShape(previousState)).toEqual(shapeName);
    });

    test('Should return empty string', () => {
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
        },
      } as CombinedState<RootState>;
      expect(nextShape(previousState)).toEqual('');
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
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
          lastShape,
        },
      } as CombinedState<RootState>;
      expect(nextShape(previousState)).toEqual(annotationSettingsNewLabel);
    });
  });

  describe('Test nextCollection selector', () => {
    const predefinedKeypointCollectionList = [
      {
        id: '1',
        collectionName: 'gauge',
        keypoints: [],
      },
      {
        id: '2',
        collectionName: 'valve',
        keypoints: [],
      },
    ];

    test('Should return first predefinedKeypointCollections', () => {
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypointCollections: predefinedKeypointCollectionList,
          },
        },
      } as CombinedState<RootState>;
      expect(nextCollection(previousState)).toEqual(
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
            },
          },
        } as Partial<ReviewReducerState>,
        annotatorWrapperReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypointCollections: predefinedKeypointCollectionList,
          },
        },
      } as CombinedState<RootState>;

      expect(nextCollection(previousState)).toEqual(
        predefinedKeypointCollectionList.find(
          (item) => item.collectionName === annotationSettingsNewLabel
        )
      );
    });

    test('Should return matching predefinedKeypointCollection (lastCollectionName)', () => {
      const lastCollectionName = 'gauge';
      const previousState = {
        ...getInitialState(),
        reviewSlice: {
          annotationSettings: {
            createNew: {},
          },
        } as Partial<ReviewReducerState>,
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
      expect(nextCollection(previousState)).toEqual(
        predefinedKeypointCollectionList.find(
          (item) => item.collectionName === lastCollectionName
        )
      );
    });
  });

  describe('Test currentCollection selector', () => {
    const predefinedKeypointCollection: KeypointCollection =
      getDummyPredefinedKeypoint('123');

    const k1Id = generateKeypointId('10', 'left');
    const k2Id = generateKeypointId('10', 'center');
    const k3Id = generateKeypointId('20', 'right');
    const k4Id = generateKeypointId('20', 'left');

    const unfinishedCollection = getDummyKeypointCollectionState('20', [k4Id]);

    const keypointCollectionState: Record<string, KeypointCollectionState> = {
      '10': getDummyKeypointCollectionState('10', [k1Id, k2Id, k3Id]),
      '20': unfinishedCollection,
    };

    const imageKeypoints: Record<string, Keypoint> = {
      [k1Id]: getDummyKeypointState('left'),
      [k2Id]: getDummyKeypointState('center'),
      [k3Id]: getDummyKeypointState('right'),
      [k4Id]: getDummyKeypointState('left'),
    };

    test('Should return null since lastCollectionId is not set', () => {
      const previousState = {
        ...initialState,
      };
      expect(currentCollection(previousState, 1)).toEqual(null);
    });

    test('Should return last collection++', () => {
      const lastCollectionId = '20';
      const collections = {
        byId: keypointCollectionState,
        allIds: ['10', '20'],
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
          keypoint: getDummyKeypointState('left'),
        },
      ];

      expect(currentCollection(previousState, 1)).toEqual({
        ...unfinishedCollection,
        annotatedResourceId: 1,
        selected: false,
        keypoints,
        remainingKeypoints: [dummyKeypoint('center'), dummyKeypoint('right')],
      });
    });
  });

  describe('Test keypointsCompleteInCollection selector', () => {
    const predefinedKeypointCollection: KeypointCollection =
      getDummyPredefinedKeypoint('123');

    const k1Id = generateKeypointId('10', 'left');
    const k2Id = generateKeypointId('10', 'center');
    const k3Id = generateKeypointId('20', 'left');

    const keypointCollectionState: Record<string, KeypointCollectionState> = {
      '10': getDummyKeypointCollectionState('10', [k1Id, k2Id]),
      '20': getDummyKeypointCollectionState('20', [k3Id]),
    };

    const imageKeypoints: Record<string, Keypoint> = {
      [k1Id]: getDummyKeypointState('left'),
      [k2Id]: getDummyKeypointState('center'),
      [k3Id]: getDummyKeypointState('left'),
    };

    test('Should return null since lastCollectionId is not set', () => {
      const previousState: AnnotatorWrapperState = {
        ...initialState,
      };
      expect(keypointsCompleteInCollection(previousState)).toEqual(null);
    });

    test('Should return counts', () => {
      const lastCollectionId = '20';
      const collections = {
        byId: keypointCollectionState,
        allIds: ['10', '20'],
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
          allIds: [k1Id, k2Id, k3Id],
          selectedIds: [],
        },
      };
      expect(keypointsCompleteInCollection(previousState)).toEqual([1, 3]);
    });
  });
});
