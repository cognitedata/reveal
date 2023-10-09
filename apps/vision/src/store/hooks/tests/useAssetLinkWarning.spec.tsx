import { waitFor, act, renderHook } from '@testing-library/react';

import { mockFileList } from '../../../__test-utils/fixtures/files';
import { getDummyImageAssetLinkAnnotation } from '../../../__test-utils/getDummyAnnotations';
import { WrappedWithProviders } from '../../../__test-utils/renderer';
import { ImageAssetLink, Status } from '../../../api/annotation/types';
import { VisionAnnotationDataType } from '../../../modules/Common/types';
import { VisionReviewAnnotation } from '../../../modules/Review/types';
import useAssetLinkWarning, { AssetWarnTypes } from '../useAssetLinkWarning';

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
  const tagAnnotation: VisionReviewAnnotation<ImageAssetLink> = {
    show: true,
    color: 'black',
    selected: false,
    annotation: getDummyImageAssetLinkAnnotation({
      id: 1,
      assetRef: { id: annotationAssetId },
    }),
  };
  const tagAnnotationSibling: VisionReviewAnnotation<ImageAssetLink> = {
    show: true,
    color: 'black',
    selected: false,
    annotation: getDummyImageAssetLinkAnnotation({
      id: 2,
      assetRef: { id: annotationSiblingAssetId },
    }),
  };
  const tagAnnotationWithSameAsset: VisionReviewAnnotation<ImageAssetLink> = {
    show: true,
    selected: false,
    color: 'black',
    annotation: getDummyImageAssetLinkAnnotation({
      id: 3,
      assetRef: { id: annotationAssetId },
    }),
  };

  it.skip('should test rendering of the hook with different props', async () => {
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

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert initial no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve tag annotation and asset linked to file
    rerender(
      getRenderProps(
        approveAnnotation(tagAnnotation),
        tagAnnotationSibling,
        [annotationAssetId],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning after approval
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve tag annotation but asset not linked to file
    rerender(
      getRenderProps(
        approveAnnotation(tagAnnotation),
        tagAnnotationSibling,
        [],
        tagAnnotationWithSameAsset
      )
    );
    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert error, file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve annotation and sibling but file only linked to sibling annotation asset
    rerender(
      getRenderProps(
        approveAnnotation(tagAnnotation),
        approveAnnotation(tagAnnotationSibling),
        [annotationSiblingAssetId],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert error file not linked after approval
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
      );
    });

    // approve annotation and sibling, file linked to both assets
    rerender(
      getRenderProps(
        approveAnnotation(tagAnnotation),
        approveAnnotation(tagAnnotationSibling),
        [annotationAssetId, annotationSiblingAssetId],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // approve annotation and sibling, file linked to both assets
    // there's a rejected annotation with same asset
    rerender(
      getRenderProps(
        approveAnnotation(tagAnnotation),
        approveAnnotation(tagAnnotationSibling),
        [annotationAssetId, annotationSiblingAssetId],
        rejectAnnotation(tagAnnotationWithSameAsset)
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation, file still linked to annotation asset
    rerender(
      getRenderProps(
        rejectAnnotation(tagAnnotation),
        approveAnnotation(tagAnnotationSibling),
        [annotationAssetId, annotationSiblingAssetId],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert error  file still linked to asset
    await waitFor(() => {
      expect(result.current).toBe(
        AssetWarnTypes.RejectedAnnotationAssetLinkedToFile
      );
    });

    // reject annotation and sibling, file still linked to annotation sibling asset
    rerender(
      getRenderProps(
        rejectAnnotation(tagAnnotation),
        rejectAnnotation(tagAnnotationSibling),
        [annotationSiblingAssetId],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation and sibling, file still linked to annotation asset
    // there's another approved annotation with same asset
    rerender(
      getRenderProps(
        rejectAnnotation(tagAnnotation),
        rejectAnnotation(tagAnnotationSibling),
        [annotationAssetId, annotationSiblingAssetId],
        approveAnnotation(tagAnnotationWithSameAsset)
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });

    // reject annotation and sibling, file not linked to assets
    rerender(
      getRenderProps(
        rejectAnnotation(tagAnnotation),
        rejectAnnotation(tagAnnotationSibling),
        [],
        tagAnnotationWithSameAsset
      )
    );

    act(() => {
      jest.runAllTimers(); // runs the mock timers in useAssetLinkWarning to get the result
    });

    // assert no warning
    await waitFor(() => {
      expect(result.current).toBe(AssetWarnTypes.NoWarning);
    });
  });
});
