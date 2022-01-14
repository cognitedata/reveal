import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';
import { act, renderHook } from '@testing-library/react-hooks';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { waitFor } from '@testing-library/react';
import { WrappedWithProviders } from 'src/__test-utils/renderer';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

describe('tests useAssetLinkWarningHook', () => {
  const getDummyAnnotation = (
    id?: number,
    modelType?: number,
    linkedResourceId?: number
  ) => {
    return {
      ...AnnotationUtils.createVisionAnnotationStub(
        id || 1,
        'pump',
        modelType || 1,
        1,
        123,
        124
      ),
      linkedResourceId,
      show: true,
      selected: false,
    } as AnnotationTableItem;
  };

  const dummyFile: FileInfo = {
    id: 1,
    uploaded: true,
    name: 'one',
    createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  };

  const approveAnnotation = (annotation: AnnotationTableItem) => ({
    ...annotation,
    status: AnnotationStatus.Verified,
  });
  const rejectAnnotation = (annotation: AnnotationTableItem) => ({
    ...annotation,
    status: AnnotationStatus.Rejected,
  });

  const linkFileToAssets = (assetIds?: number[]) => ({
    ...dummyFile,
    assetIds,
  });

  const getRenderProps = (
    annotation: AnnotationTableItem,
    annotationSibling: AnnotationTableItem,
    fileAssetIds: number[]
  ) => ({
    annotation,
    file: linkFileToAssets(fileAssetIds),
    allAnnotations: [annotation, annotationSibling],
  });

  const annotationAssetId = 1;
  const annotationSiblingAssetId = 2;
  const tagAnnotation = getDummyAnnotation(
    1,
    VisionAPIType.TagDetection,
    annotationAssetId
  );
  const tagAnnotationSibling = getDummyAnnotation(
    2,
    VisionAPIType.TagDetection,
    annotationSiblingAssetId
  );

  test('initial value', async () => {
    jest.mock('@cognite/cdf-sdk-singleton');
    jest.useFakeTimers();

    // render hook for first time
    const { result, rerender } = renderHook(
      ({ annotation, file, allAnnotations }) =>
        useAssetLinkWarning(annotation, file, allAnnotations),
      {
        wrapper: WrappedWithProviders,
        initialProps: getRenderProps(tagAnnotation, tagAnnotationSibling, []),
      }
    );

    // assert initial no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve tag annotation and asset linked to file
    act(() => {
      rerender(
        getRenderProps(approveAnnotation(tagAnnotation), tagAnnotationSibling, [
          annotationAssetId,
        ])
      );
    });

    // assert no warning after approval
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve tag annotation but asset not linked to file
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          tagAnnotationSibling,
          []
        )
      );
    });

    // assert error, file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve both annotations but file only linked to sibling annotation asset
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationSiblingAssetId]
        )
      );
    });

    // assert error file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve both annotations file linked to both assets
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId]
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation file still linked to annotation asset
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId]
        )
      );
    });

    // assert error  file still linked to asset
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.RejectedAnnotationAssetLinkedToFile
      );
    });

    // reject both annotations file still linked to annotation sibling asset
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          rejectAnnotation(tagAnnotationSibling),
          [annotationSiblingAssetId]
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });
  });
});
