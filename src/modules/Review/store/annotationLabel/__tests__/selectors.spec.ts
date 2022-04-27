import { AnnotationStatus } from 'src/utils/AnnotationUtils';

import { initialState } from 'src/modules/Review/store/annotationLabel/slice';
import {
  nextShape,
  nextCollection,
  nextKeypoint,
  currentCollection,
  keypointsCompleteInCollection,
} from 'src/modules/Review/store/annotationLabel/selectors';
import { getInitialState } from 'src/__test-utils/store.utils';
import { RootState } from 'src/store/rootReducer';
import { CombinedState } from '@reduxjs/toolkit';
import { ReviewReducerState } from 'src/modules/Review/store/reviewSlice';

describe('Test annotationLabel selectors', () => {
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
        annotationLabelReducer: {
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
        annotationLabelReducer: {
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
        annotationLabelReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedKeypoints:
              initialState.predefinedAnnotations.predefinedKeypoints,
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
        annotationLabelReducer: {
          ...initialState,
        },
      } as CombinedState<RootState>;
      expect(nextShape(previousState)).toEqual('');
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
        annotationLabelReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypoints: predefinedKeypointCollectionList,
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
        annotationLabelReducer: {
          ...initialState,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypoints: predefinedKeypointCollectionList,
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
        annotationLabelReducer: {
          ...initialState,
          lastCollectionName,
          predefinedAnnotations: {
            predefinedShapes:
              initialState.predefinedAnnotations.predefinedShapes,
            predefinedKeypoints: predefinedKeypointCollectionList,
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

  describe('Test nextKeypoint selector', () => {
    const predefinedKeypointCollection = {
      id: '123',
      collectionName: 'gauge',
      keypoints: [
        {
          caption: 'center',
          order: '0',
          color: 'red',
        },
        {
          caption: 'left',
          order: '1',
          color: 'blue',
        },
      ],
    };

    const keypointStateList = predefinedKeypointCollection.keypoints.map(
      (item, index) => {
        return {
          id: index.toString(),
          caption: item.caption,
          order: item.order,
          color: item.color,
        };
      }
    );

    test('Should return null since no predefined collections exists', () => {
      const previousState = {
        ...initialState,
      };
      expect(nextKeypoint(previousState)).toEqual(null);
    });

    test('Should return first point in predefined collection since lastKeyPoint is not set', () => {
      const previousState = {
        ...initialState,
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypoints: [predefinedKeypointCollection],
        },
      };
      expect(nextKeypoint(previousState)).toEqual(
        predefinedKeypointCollection.keypoints[0]
      );
    });

    test('Should return next point in predefined collection since lastKeyPoint is set', () => {
      const lastKeyPoint = keypointStateList[0].id;
      const previousState = {
        ...initialState,
        lastKeyPoint,
        keypointMap: {
          byId: Object.assign(
            {},
            ...keypointStateList.map((item) => ({ [item.id]: item }))
          ),
          allIds: keypointStateList.map((item) => item.id),
          selectedIds: [],
        },
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypoints: [predefinedKeypointCollection],
        },
      };
      expect(nextKeypoint(previousState)).toEqual(
        predefinedKeypointCollection.keypoints[1]
      );
    });

    test('Should return first point in predefined collection since lastKeyPoint is set to last keypoint in predefined collection', () => {
      const lastKeyPoint = keypointStateList[1].id;
      const previousState = {
        ...initialState,
        lastKeyPoint,
        keypointMap: {
          byId: Object.assign(
            {},
            ...keypointStateList.map((item) => ({ [item.id]: item }))
          ),
          allIds: keypointStateList.map((item) => item.id),
          selectedIds: [],
        },
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypoints: [predefinedKeypointCollection],
        },
      };
      expect(nextKeypoint(previousState)).toEqual(
        predefinedKeypointCollection.keypoints[0]
      );
    });
  });

  describe('Test currentCollection selector', () => {
    const predefinedKeypointCollection = {
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

    const keypointCollectionStateList = [
      {
        id: '10',
        show: true,
        status: AnnotationStatus.Verified,
        name: predefinedKeypointCollection.collectionName,
        keypointIds: predefinedKeypointCollection.keypoints.map(
          (item) => item.id
        ),
      },
      {
        id: '20',
        show: true,
        status: AnnotationStatus.Rejected,
        name: predefinedKeypointCollection.collectionName,
        keypointIds: predefinedKeypointCollection.keypoints.map(
          (item) => item.id
        ),
      },
    ];

    const keypointStateList = predefinedKeypointCollection.keypoints.map(
      (item, index) => {
        return {
          id: index.toString(),
          caption: item.caption,
          order: item.order,
          color: item.color,
        };
      }
    );

    test('Should return null since lastCollectionId is not set', () => {
      const previousState = {
        ...initialState,
      };
      expect(currentCollection(previousState)).toEqual(null);
    });

    test('Should return last collection++', () => {
      const lastCollectionId = keypointCollectionStateList[0].id;
      const collections = {
        byId: Object.assign(
          {},
          ...keypointCollectionStateList.map((item) => ({ [item.id]: item }))
        ),
        allIds: keypointStateList.map((item) => item.id),
        selectedIds: [],
      };
      const previousState = {
        ...initialState,
        lastCollectionId,
        collections,
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypoints: [predefinedKeypointCollection],
        },
        keypointMap: {
          byId: Object.assign(
            {},
            ...keypointStateList.map((item) => ({ [item.id]: item }))
          ),
          allIds: keypointStateList.map((item) => item.id),
          selectedIds: [],
        },
      };
      expect(currentCollection(previousState)).toEqual({
        ...keypointCollectionStateList[0],
        selected: false,
        keypoints: keypointStateList.map((item) => {
          return { ...item, selected: false };
        }),
        remainingKeypoints: [],
      });
    });
  });

  describe('Test keypointsCompleteInCollection selector', () => {
    const predefinedKeypointCollection = {
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

    const keypointCollectionStateList = [
      {
        id: '10',
        show: true,
        status: AnnotationStatus.Verified,
        name: predefinedKeypointCollection.collectionName,
        keypointIds: predefinedKeypointCollection.keypoints.map(
          (item) => item.id
        ),
      },
      {
        id: '20',
        show: true,
        status: AnnotationStatus.Rejected,
        name: predefinedKeypointCollection.collectionName,
        keypointIds: predefinedKeypointCollection.keypoints.map(
          (item) => item.id
        ),
      },
    ];

    const keypointStateList = predefinedKeypointCollection.keypoints.map(
      (item, index) => {
        return {
          id: index.toString(),
          caption: item.caption,
          order: item.order,
          color: item.color,
        };
      }
    );

    test('Should return null since lastCollectionId is not set', () => {
      const previousState = {
        ...initialState,
      };
      expect(keypointsCompleteInCollection(previousState)).toEqual(null);
    });

    test('Should return counts', () => {
      const lastCollectionId = keypointCollectionStateList[0].id;
      const collections = {
        byId: Object.assign(
          {},
          ...keypointCollectionStateList.map((item) => ({ [item.id]: item }))
        ),
        allIds: keypointStateList.map((item) => item.id),
        selectedIds: [],
      };
      const previousState = {
        ...initialState,
        lastCollectionId,
        collections,
        predefinedAnnotations: {
          predefinedShapes: initialState.predefinedAnnotations.predefinedShapes,
          predefinedKeypoints: [predefinedKeypointCollection],
        },
        keypointMap: {
          byId: Object.assign(
            {},
            ...keypointStateList.map((item) => ({ [item.id]: item }))
          ),
          allIds: keypointStateList.map((item) => item.id),
          selectedIds: [],
        },
      };
      expect(keypointsCompleteInCollection(previousState)).toEqual([2, 2]);
    });
  });
});
