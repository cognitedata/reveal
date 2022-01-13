import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';
import { act, renderHook } from '@testing-library/react-hooks';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { WrappedWithProviders } from 'src/__test-utils/renderer';

describe('tests useAssetLinkWarningHook', () => {
  const getDummyAnnotation = (
    id?: number,
    modelType?: number,
    linkedResourceId?: number,
    status?: AnnotationStatus
  ) => {
    return {
      ...AnnotationUtils.createVisionAnnotationStub(
        id || 1,
        'pump',
        modelType || 1,
        1,
        123,
        124,
        { shape: 'rectangle', vertices: [] },
        undefined,
        undefined,
        status || AnnotationStatus.Unhandled,
        undefined,
        undefined,
        undefined,
        linkedResourceId
      ),
      show: true,
      selected: false,
    };
  };

  const getDummyFile = (linkedAssetIds?: number[]) => {
    return {
      id: 1,
      uploaded: true,
      name: 'one',
      assetIds: linkedAssetIds || [],
      createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
      lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
      sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
      uploadedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    };
  };

  test('initial value', async () => {
    jest.mock('@cognite/cdf-sdk-singleton');
    jest.useFakeTimers();

    // @ts-ignore
    const { result, rerender } = renderHook(
      ({ annotation, file, allAnnotations }) =>
        useAssetLinkWarning(annotation, file, allAnnotations),
      {
        wrapper: WrappedWithProviders,
        initialProps: {
          annotation: getDummyAnnotation(1, VisionAPIType.TagDetection, 1),
          file: getDummyFile(),
          allAnnotations: [
            getDummyAnnotation(1, VisionAPIType.TagDetection, 1),
            getDummyAnnotation(2, VisionAPIType.TagDetection, 2),
          ],
        },
      }
    );

    await waitFor(() => {
      // assert initial state
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    act(() => {
      // approve one annotation
      rerender({
        annotation: getDummyAnnotation(
          1,
          VisionAPIType.TagDetection,
          1,
          AnnotationStatus.Verified
        ),
        file: getDummyFile([1]),
        allAnnotations: [
          getDummyAnnotation(
            1,
            VisionAPIType.TagDetection,
            1,
            AnnotationStatus.Verified
          ),
          getDummyAnnotation(2, VisionAPIType.TagDetection, 2),
        ],
      });
    });
    await waitFor(() => {
      // assert initial state
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    act(() => {
      // approve one annotation but asset not linked
      rerender({
        annotation: getDummyAnnotation(
          1,
          VisionAPIType.TagDetection,
          1,
          AnnotationStatus.Verified
        ),
        file: getDummyFile(),
        allAnnotations: [
          getDummyAnnotation(
            1,
            VisionAPIType.TagDetection,
            1,
            AnnotationStatus.Verified
          ),
          getDummyAnnotation(2, VisionAPIType.TagDetection, 2),
        ],
      });
    });
    await waitFor(() => {
      // assert initial state
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });
  });
});
