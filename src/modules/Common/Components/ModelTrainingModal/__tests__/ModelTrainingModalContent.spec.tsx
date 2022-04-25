import React from 'react';

import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';
import { ModelTrainingModalContent } from 'src/modules/Common/Components/ModelTrainingModal/ModelTrainingModalContent';
import { getMockedStore } from 'src/__test-utils/store.utils';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import {
  MAX_AUTOML_ANNOTATIONS_TYPE,
  MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE,
} from 'src/api/vision/autoML/constants';

jest.mock('src/modules/Process/store/slice', () => ({
  ...jest.requireActual('src/modules/Process/store/slice'),
  makeSelectAnnotationStatuses: () => {
    return () => {
      return {
        tag: {},
        gdpr: {},
        text: {},
        objects: {},
      };
    };
  },
}));

jest.mock('src/api/vision/autoML/constants', () => ({
  ...jest.requireActual('src/api/vision/autoML/constants'),
  MIN_AUTOML_DATASET_SIZE: 2,
  MAX_AUTOML_ANNOTATIONS_TYPE: 2,
  MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE: 2,
}));

interface MockDataType {
  id: number;
  name: string;
  mimeType: string;
  annotations: { id: number; text: string }[];
}

describe('ModelTrainingModalContent', () => {
  const TestComponent = (props: any) => {
    return <ModelTrainingModalContent {...props} />;
  };

  const getMockData = (data: MockDataType[]) => {
    const getDummyAnnotation = (id: number, text: string, fileId: number) => {
      return AnnotationUtils.createVisionAnnotationStubV1(
        id || 1,
        text || 'pump',
        1,
        fileId,
        123,
        124,
        { shape: 'rectangle', vertices: [] }
      );
    };

    const props = {
      onCancel: () => {},
      selectedFiles: data.map((item: MockDataType) => {
        return {
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          uploaded: true,
          createdTime: 1,
          lastUpdatedTime: 1,
          linkedAnnotations: [],
        };
      }),
    };

    const annotationState = {
      files: {
        byId: Object.assign(
          {},
          ...data.map((item: MockDataType) => ({
            [item.id]: item.annotations.map(
              (a: { id: number; text: string }) => a.id
            ),
          }))
        ),
      },

      annotations: {
        byId: Object.assign(
          {},
          ...data
            .map((item: MockDataType) =>
              item.annotations.map((annotation) => ({
                [annotation.id]: getDummyAnnotation(
                  annotation.id,
                  annotation.text,
                  item.id
                ),
              }))
            )
            .flat()
        ),
      },
    };

    return { props, annotationState };
  };

  test('Start training should be enabled, all validation pass', async () => {
    const data = [
      {
        id: 1,
        name: 'one',
        mimeType: 'image/png',
        annotations: [
          { id: 1, text: 'pump' },
          { id: 2, text: 'valve' },
        ],
      },
      {
        id: 2,
        name: 'two',
        mimeType: 'image/jpeg',
        annotations: [
          { id: 3, text: 'pump' },
          { id: 4, text: 'valve' },
        ],
      },
    ] as MockDataType[];
    const { props, annotationState } = getMockData(data);

    const store = getMockedStore({
      annotationV1Reducer: annotationState,
    });

    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Model configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Create computer vision model from files')
    ).toBeInTheDocument();

    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();

    expect(screen.getByTestId('start-training-button')).not.toBeDisabled();

    // hover start training button
    fireEvent.mouseEnter(screen.getByTestId('start-training-button'), {
      bubbles: true,
    });

    expect(
      screen.queryByText(
        `Images must be of type jpeg or png, with mime type image/png or image/jpeg`
      )
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        `There can maximum be ${MAX_AUTOML_ANNOTATIONS_TYPE} unique annotation types`
      )
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        `There must be at least ${MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE} images per unique annotation type`
      )
    ).not.toBeInTheDocument();
  });
  test('Start training should be disabled, invalid file type', async () => {
    const data = [
      {
        id: 1,
        name: 'one',
        mimeType: 'image/png',
        annotations: [{ id: 1, text: 'pump' }],
      },
      {
        id: 2,
        name: 'two',
        mimeType: 'video/mp4',
        annotations: [{ id: 2, text: 'valve' }],
      },
    ] as MockDataType[];
    const { props, annotationState } = getMockData(data);

    const store = getMockedStore({
      annotationV1Reducer: annotationState,
    });

    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Model configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Create computer vision model from files')
    ).toBeInTheDocument();

    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();

    expect(screen.getByTestId('start-training-button')).toBeDisabled();
    fireEvent.mouseEnter(screen.getByTestId('start-training-button'), {
      bubbles: true,
    });

    expect(
      await screen.findByText(
        `Images must be of type jpeg or png, with mime type image/png or image/jpeg`
      )
    ).toBeInTheDocument();
  });

  test('Start training should be disabled, files without annotations', async () => {
    const data = [
      {
        id: 1,
        name: 'one',
        mimeType: 'image/png',
        annotations: [{ id: 1, text: 'pump' }],
      },
      {
        id: 2,
        name: 'two',
        mimeType: 'image/png',
        annotations: [],
      },
    ] as MockDataType[];
    const { props, annotationState } = getMockData(data);

    const store = getMockedStore({
      annotationV1Reducer: annotationState,
    });

    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Model configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Create computer vision model from files')
    ).toBeInTheDocument();

    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();

    expect(screen.getByTestId('start-training-button')).toBeDisabled();
    fireEvent.mouseEnter(screen.getByTestId('start-training-button'), {
      bubbles: true,
    });

    expect(
      await screen.findByText(`All images must have at least one annotation`)
    ).toBeInTheDocument();
  });

  test('Start training should be disabled, too many annotation types', async () => {
    const data = [
      {
        id: 1,
        name: 'one',
        mimeType: 'image/png',
        annotations: [
          { id: 1, text: 'pump' },
          { id: 2, text: 'valve' },
          { id: 3, text: 'gauge' },
        ],
      },
      {
        id: 2,
        name: 'two',
        mimeType: 'image/jpeg',
        annotations: [{ id: 4, text: 'valve' }],
      },
    ] as MockDataType[];
    const { props, annotationState } = getMockData(data);

    const store = getMockedStore({
      annotationV1Reducer: annotationState,
    });

    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Model configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Create computer vision model from files')
    ).toBeInTheDocument();

    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();

    expect(screen.getByTestId('start-training-button')).toBeDisabled();
    fireEvent.mouseEnter(screen.getByTestId('start-training-button'), {
      bubbles: true,
    });

    expect(
      await screen.findByText(
        `There can maximum be ${MAX_AUTOML_ANNOTATIONS_TYPE} unique annotation types`
      )
    ).toBeInTheDocument();
  });

  test('Start training should be disabled, too few images per annotation types', async () => {
    const data = [
      {
        id: 1,
        name: 'one',
        mimeType: 'image/png',
        annotations: [
          { id: 1, text: 'pump' },
          { id: 2, text: 'valve' },
        ],
      },
      {
        id: 2,
        name: 'two',
        mimeType: 'image/jpeg',
        annotations: [{ id: 3, text: 'valve' }],
      },
    ] as MockDataType[];
    const { props, annotationState } = getMockData(data);

    const store = getMockedStore({
      annotationV1Reducer: annotationState,
    });

    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Model configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Create computer vision model from files')
    ).toBeInTheDocument();

    expect(screen.getByTestId('cancel-button')).not.toBeDisabled();

    expect(screen.getByTestId('start-training-button')).toBeDisabled();
    fireEvent.mouseEnter(screen.getByTestId('start-training-button'), {
      bubbles: true,
    });

    expect(
      await screen.findByText(
        `There must be at least ${MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE} images per unique annotation type`
      )
    ).toBeInTheDocument();
  });
});
