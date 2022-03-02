import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';
import { act, renderHook } from '@testing-library/react-hooks';
import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { waitFor } from '@testing-library/react';
import { WrappedWithProviders } from 'src/__test-utils/renderer';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { mockFileList } from 'src/__test-utils/fixtures/files';

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

const approveAnnotation = (annotation: AnnotationTableItem) => ({
  ...annotation,
  status: AnnotationStatus.Verified,
});
const rejectAnnotation = (annotation: AnnotationTableItem) => ({
  ...annotation,
  status: AnnotationStatus.Rejected,
});

const linkFileToAssets = (assetIds?: number[]) => ({
  ...mockFileList[0],
  assetIds,
});

const getRenderProps = (
  annotation: AnnotationTableItem,
  annotationSibling: AnnotationTableItem,
  fileAssetIds: number[],
  annotationWithSameAsset?: AnnotationTableItem
) => ({
  annotation,
  file: linkFileToAssets(fileAssetIds),
  allAnnotations: annotationWithSameAsset
    ? [annotation, annotationSibling, annotationWithSameAsset]
    : [annotation, annotationSibling],
});

describe('tests useAssetLinkWarningHook', () => {
  const annotationAssetId = 1;
  const annotationSiblingAssetId = 2;
  const tagAnnotation = getDummyAnnotation(
    1,
    VisionDetectionModelType.TagDetection,
    annotationAssetId
  );
  const tagAnnotationSibling = getDummyAnnotation(
    2,
    VisionDetectionModelType.TagDetection,
    annotationSiblingAssetId
  );
  const tagAnnotationWithSameAsset = getDummyAnnotation(
    3,
    VisionDetectionModelType.TagDetection,
    annotationAssetId
  );

  it('should test rendering of the hook with different props', async () => {
    jest.mock('@cognite/cdf-sdk-singleton');
    jest.useFakeTimers();

    // render hook for first time
    const { result, rerender } = renderHook(
      ({ annotation, file, allAnnotations }) =>
        useAssetLinkWarning(annotation, file, allAnnotations),
      {
        wrapper: WrappedWithProviders,
        initialProps: getRenderProps(
          tagAnnotation,
          tagAnnotationSibling,
          [],
          tagAnnotationWithSameAsset
        ),
      }
    );

    // assert initial no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve tag annotation and asset linked to file
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          tagAnnotationSibling,
          [annotationAssetId],
          tagAnnotationWithSameAsset
        )
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
          [],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert error, file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve annotation and sibling but file only linked to sibling annotation asset
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationSiblingAssetId],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert error file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve annotation and sibling, file linked to both assets
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve annotation and sibling, file linked to both assets
    // there's a rejected annotation with same asset
    act(() => {
      rerender(
        getRenderProps(
          approveAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId],
          rejectAnnotation(tagAnnotationWithSameAsset)
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation, file still linked to annotation asset
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          approveAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert error  file still linked to asset
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.RejectedAnnotationAssetLinkedToFile
      );
    });

    // reject annotation and sibling, file still linked to annotation sibling asset
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          rejectAnnotation(tagAnnotationSibling),
          [annotationSiblingAssetId],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation and sibling, file still linked to annotation asset
    // there's another approved annotation with same asset
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          rejectAnnotation(tagAnnotationSibling),
          [annotationAssetId, annotationSiblingAssetId],
          approveAnnotation(tagAnnotationWithSameAsset)
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation and sibling, file not linked to assets
    act(() => {
      rerender(
        getRenderProps(
          rejectAnnotation(tagAnnotation),
          rejectAnnotation(tagAnnotationSibling),
          [],
          tagAnnotationWithSameAsset
        )
      );
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });
  });
});
