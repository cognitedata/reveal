import React from 'react';
import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';
import { useIsCurrentKeypointCollectionComplete } from 'src/modules/Review/store/annotatorWrapper/hooks';
import { PredefinedKeypoint } from 'src/modules/Review/types';
import { getMockedStore } from 'src/__test-utils/store.utils';
import { initialState as annotatorWrapperInitialState } from 'src/modules/Review/store/annotatorWrapper/slice';
import { initialState as annotatorAnnotationInitialState } from 'src/modules/Common/store/annotation/slice';
import { Status } from 'src/api/annotation/types';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';

const COMPLETED_ID = 'completed';
const NOT_COMPLETED_ID = 'notCompleted';

const TestComponent = (fileId: number) => {
  const currentKeypointCollectionIsComplete =
    useIsCurrentKeypointCollectionComplete(fileId);
  return (
    <div>
      {currentKeypointCollectionIsComplete ? (
        <div data-testid={COMPLETED_ID} />
      ) : (
        <div data-testid={NOT_COMPLETED_ID} />
      )}
    </div>
  );
};

/** Test Data */
const gaugeKeypoints: PredefinedKeypoint[] = [
  {
    caption: 'left',
    order: '1',
    color: 'red',
    defaultPosition: [0.25, 0.25],
  },
  {
    caption: 'center',
    order: '2',
    color: 'red',
    defaultPosition: [0.5, 0.5],
  },
  {
    caption: 'right',
    order: '3',
    color: 'red',
    defaultPosition: [0.75, 0.25],
  },
];
const valveKeypoints: PredefinedKeypoint[] = [
  {
    caption: 'close',
    order: '1',
    color: 'red',
    defaultPosition: [0.25, 0.25],
  },
  {
    caption: 'center',
    order: '2',
    color: 'red',
    defaultPosition: [0.5, 0.5],
  },
  {
    caption: 'open',
    order: '3',
    color: 'red',
    defaultPosition: [0.75, 0.25],
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
    color: 'red',
  },
];
const baseAnnotationReducer: AnnotationState = {
  ...annotatorAnnotationInitialState,
  annotationColorMap: {
    left: 'red',
    center: 'red',
    right: 'red',
  },
};
const baseAnnotatorWrapperReducer: AnnotatorWrapperState = {
  ...annotatorWrapperInitialState,
  predefinedAnnotations: {
    predefinedKeypointCollections: predefinedKeypointCollectionList,
    predefinedShapes: [],
  },
  keypointMap: {
    byId: {
      k1: ['left', { confidence: 1, point: { x: 0.25, y: 0.25 } }],
      k2: ['center', { confidence: 1, point: { x: 0.5, y: 0.5 } }],
      k3: ['right', { confidence: 1, point: { x: 0.75, y: 0.75 } }],
      k4: ['left', { confidence: 1, point: { x: 0.25, y: 0.25 } }],
      k5: ['center', { confidence: 1, point: { x: 0.5, y: 0.5 } }],
    },
    allIds: ['k1', 'k2', 'k3', 'k4', 'k5'],
    selectedIds: [],
  },
  collections: {
    byId: {
      100: {
        id: 1,
        keypointIds: ['k1', 'k2', 'k3'],
        label: 'gauge',
        show: true,
        status: Status.Suggested,
      },
      200: {
        id: 1,
        keypointIds: ['k4', 'k5'],
        label: 'gauge',
        show: true,
        status: Status.Suggested,
      },
      300: {
        id: 1,
        keypointIds: [],
        label: 'gauge',
        show: true,
        status: Status.Suggested,
      },
      400: {
        id: 1,
        keypointIds: [],
        label: 'invalid-label', // do not exist in the predefinedKeypointCollectionList
        show: true,
        status: Status.Suggested,
      },
    },
    allIds: [100, 200, 300, 400],
    selectedIds: [],
  },
  lastCollectionId: 100,
  lastKeyPoint: 'right',
};

describe('Test useIsCurrentKeypointCollectionComplete hook', () => {
  test('When not tempKeypointCollection selected', () => {
    const storeWithNoKeypointsAdded = getMockedStore({
      annotationReducer: baseAnnotationReducer,
      annotatorWrapperReducer: {
        ...baseAnnotatorWrapperReducer,
        lastCollectionId: undefined,
      },
    });
    testRenderer(TestComponent, storeWithNoKeypointsAdded, { fileId: 1 });
    expect(screen.queryByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
  });

  describe('When a tempKeypointCollection is selected', () => {
    test('when keypointCollectionTemplate not found', () => {
      const storeWithCompletedCollection = getMockedStore({
        annotationReducer: baseAnnotationReducer,
        annotatorWrapperReducer: {
          ...baseAnnotatorWrapperReducer,
          lastCollectionId: 400,
        },
      });
      testRenderer(TestComponent, storeWithCompletedCollection, {
        fileId: 1,
      });
      expect(screen.queryByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
    });

    describe('when keypointCollectionTemplate is found', () => {
      test('When all the keypoints in current collection were added', () => {
        const storeWithCompletedCollection = getMockedStore({
          annotationReducer: baseAnnotationReducer,
          annotatorWrapperReducer: baseAnnotatorWrapperReducer,
        });
        testRenderer(TestComponent, storeWithCompletedCollection, {
          fileId: 1,
        });
        expect(screen.queryByTestId(COMPLETED_ID)).toBeInTheDocument();
      });

      test('When some of the keypoints in current collection were added', () => {
        const storeWithSomeKeypointsAdded = getMockedStore({
          annotationReducer: baseAnnotationReducer,
          annotatorWrapperReducer: {
            ...baseAnnotatorWrapperReducer,
            lastCollectionId: 200,
          },
        });
        testRenderer(TestComponent, storeWithSomeKeypointsAdded, { fileId: 1 });
        expect(screen.queryByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
      });

      test('When no keypoints in current collection were added', () => {
        const storeWithNoKeypointsAdded = getMockedStore({
          annotationReducer: baseAnnotationReducer,
          annotatorWrapperReducer: {
            ...baseAnnotatorWrapperReducer,
            lastCollectionId: 300,
          },
        });
        testRenderer(TestComponent, storeWithNoKeypointsAdded, { fileId: 1 });
        expect(screen.queryByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
      });
    });
  });
});
