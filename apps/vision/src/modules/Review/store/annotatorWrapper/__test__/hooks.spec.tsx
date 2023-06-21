import React from 'react';

import { screen } from '@testing-library/react';
import { getDummyKeypointState } from '@vision/__test-utils/annotations';
import { testRenderer } from '@vision/__test-utils/renderer';
import { getMockedStore } from '@vision/__test-utils/store.utils';
import { Status } from '@vision/api/annotation/types';
import { initialState as annotatorAnnotationInitialState } from '@vision/modules/Common/store/annotation/slice';
import { AnnotationState } from '@vision/modules/Common/store/annotation/types';
import { useIsCurrentKeypointCollectionComplete } from '@vision/modules/Review/store/annotatorWrapper/hooks';
import { initialState as annotatorWrapperInitialState } from '@vision/modules/Review/store/annotatorWrapper/slice';
import { AnnotatorWrapperState } from '@vision/modules/Review/store/annotatorWrapper/type';
import { PredefinedKeypoint } from '@vision/modules/Review/types';

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
    caption: 'close',
    order: '1',
    color: 'red',
  },
  {
    caption: 'center',
    order: '2',
    color: 'red',
  },
  {
    caption: 'open',
    order: '3',
    color: 'red',
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
      k1: getDummyKeypointState('left', 1, { x: 0.25, y: 0.25 }),
      k2: getDummyKeypointState('center', 1, { x: 0.5, y: 0.5 }),
      k3: getDummyKeypointState('right', 1, { x: 0.75, y: 0.75 }),
      k4: getDummyKeypointState('left', 1, { x: 0.25, y: 0.25 }),
      k5: getDummyKeypointState('center', 1, { x: 0.5, y: 0.5 }),
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
        // collection with incomplete keypoints
        id: 1,
        keypointIds: ['k4', 'k5'],
        label: 'gauge',
        show: true,
        status: Status.Suggested,
      },
      300: {
        // collection with no keypoints
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
    expect(screen.getByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
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
      expect(screen.getByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
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
        expect(screen.getByTestId(COMPLETED_ID)).toBeInTheDocument();
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
        expect(screen.getByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
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
        expect(screen.getByTestId(NOT_COMPLETED_ID)).toBeInTheDocument();
      });
    });
  });
});
