import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';
import { act, renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { WrappedWithProviders } from 'src/__test-utils/renderer';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { getDummyImageAssetLinkAnnotation } from 'src/__test-utils/getDummyAnnotations';
import { ImageAssetLink, Status } from 'src/api/annotation/types';
import { VisionReviewAnnotation } from 'src/modules/Review/types';

const approveAnnotation = (
  reviewAnnotation: VisionReviewAnnotation<ImageAssetLink>
) => ({
  ...reviewAnnotation,
  annotation: {
    ...reviewAnnotation.annotation,
    status: Status.Approved,
  },
});
const rejectAnnotation = (
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>
) => ({
  ...reviewAnnotation,
  annotation: {
    ...reviewAnnotation.annotation,
    status: Status.Rejected,
  },
});

const linkFileToAssets = (assetIds?: number[]) => ({
  ...mockFileList[0],
  assetIds,
});

const getRenderProps = (
  annotation: VisionReviewAnnotation<VisionAnnotationDataType>,
  annotationSibling: VisionReviewAnnotation<VisionAnnotationDataType>,
  fileAssetIds: number[],
  annotationWithSameAsset?: VisionReviewAnnotation<VisionAnnotationDataType>
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
  const tagAnnotation = {
    show: true,
    selected: false,
    annotation: getDummyImageAssetLinkAnnotation({
      id: 1,
      assetRef: { id: annotationAssetId },
    }),
  };
  const tagAnnotationSibling = {
    show: true,
    selected: false,
    annotation: getDummyImageAssetLinkAnnotation({
      id: 2,
      assetRef: { id: annotationSiblingAssetId },
    }),
  };
  const tagAnnotationWithSameAsset = {
    show: true,
    selected: false,
    annotation: getDummyImageAssetLinkAnnotation({
      id: 3,
      assetRef: { id: annotationAssetId },
    }),
  };

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
