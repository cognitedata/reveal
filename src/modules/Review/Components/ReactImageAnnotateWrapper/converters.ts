import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  isImageAssetLinkData,
  isImageClassificationData,
  isImageExtractedTextData,
  isImageKeypointCollectionData,
  isImageObjectDetectionBoundingBoxData,
  isImageObjectDetectionPolygonData,
  isImageObjectDetectionPolylineData,
} from 'src/modules/Common/types/typeGuards';
import {
  ReviewKeypoint,
  TurnKeypointType,
  UnsavedKeypointCollection,
  VisionReviewAnnotation,
} from 'src/modules/Review/store/review/types';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotatorBaseRegion,
  AnnotatorBoxRegion,
  AnnotatorKeypointLabel,
  AnnotatorLineRegion,
  AnnotatorPointRegion,
  AnnotatorPolygonRegion,
  AnnotatorRegion,
  AnnotatorRegionType,
  isAnnotatorBoxRegion,
  isAnnotatorLineRegion,
  isAnnotatorPointRegion,
  isAnnotatorPolygonRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import {
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
  Status,
} from 'src/api/annotation/types';
import isEmpty from 'lodash-es/isEmpty';

/**
 * Converts array of VisionAnnotations to Array of AnnotatorRegions
 * @param reviewAnnotations
 */
export const convertVisionReviewAnnotationsToRegions = (
  reviewAnnotations: VisionReviewAnnotation<VisionAnnotationDataType>[]
): AnnotatorRegion[] => {
  const regions = reviewAnnotations
    .map((reviewAnnotation) =>
      convertVisionReviewAnnotationToRegions(reviewAnnotation)
    )
    .flat();

  return regions;
};

/**
 * Converts single VisionAnnotation to an Array of AnnotatorRegions
 * @param reviewAnnotation
 */
export const convertVisionReviewAnnotationToRegions = (
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>
): AnnotatorRegion[] => {
  const regions: AnnotatorRegion[] = [];
  const { annotation } = reviewAnnotation;

  if (
    !annotation ||
    !annotation.id ||
    !annotation.annotationType ||
    !annotation.status
  ) {
    console.error(
      'ReactImageAnnotateWrapper: fields id or annotationType or status is missing in annotation',
      JSON.stringify(annotation)
    );
    return regions;
  }

  const baseRegionData: AnnotatorBaseRegion = {
    id: annotation.id,
    annotation: reviewAnnotation,
    highlighted: reviewAnnotation.selected,
    editingLabels: reviewAnnotation.selected,
    tags: [getAnnotationLabelOrText(annotation), null, null, null], // todo: remove once library changes are done to remove tags array usages
    annotationType: annotation.annotationType,
    annotationLabelOrText: getAnnotationLabelOrText(annotation),
    status: annotation.status,
    color: 'red', // read this from reviewAnnotation.color once it is introduced.
    cls: '',
    locked: false,
    visible: reviewAnnotation.show,
  };
  if (isImageClassificationData(annotation)) {
    // no regions for classification
  } else if (isImageAssetLinkData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: annotation.textRegion.xMin,
        y: annotation.textRegion.yMin,
        w: annotation.textRegion.xMax - annotation.textRegion.xMin,
        h: annotation.textRegion.yMax - annotation.textRegion.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageExtractedTextData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: annotation.textRegion.xMin,
        y: annotation.textRegion.yMin,
        w: annotation.textRegion.xMax - annotation.textRegion.xMin,
        h: annotation.textRegion.yMax - annotation.textRegion.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageObjectDetectionBoundingBoxData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMin,
        y: (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMin,
        w:
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMax -
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMin,
        h:
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMax -
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageObjectDetectionPolygonData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.PolygonRegion,
        points: (
          annotation as ImageObjectDetectionPolygon
        ).polygon.vertices.map((pt) => [pt.x, pt.y]),
      },
      ...baseRegionData,
    } as AnnotatorPolygonRegion);
  } else if (isImageObjectDetectionPolylineData(annotation)) {
    console.error(
      'ReactImageAnnotateWrapper: Polyline cannot be visualized correctly by this viewer'
    );
    regions.push({
      ...{
        type: AnnotatorRegionType.LineRegion,
        x1: (annotation as ImageObjectDetectionPolyline).polyline.vertices[0].x,
        y1: (annotation as ImageObjectDetectionPolyline).polyline.vertices[0].y,
        x2: (annotation as ImageObjectDetectionPolyline).polyline.vertices[1].x,
        y2: (annotation as ImageObjectDetectionPolyline).polyline.vertices[1].y,
      },
      ...baseRegionData,
    } as AnnotatorLineRegion);
  } else if (isImageKeypointCollectionData(annotation)) {
    (
      annotation as TurnKeypointType<VisionAnnotation<ImageKeypointCollection>>
    ).keypoints.forEach((keypoint, index) => {
      regions.push({
        ...{
          type: AnnotatorRegionType.PointRegion,
          x: keypoint.keypoint.point.x,
          y: keypoint.keypoint.point.y,
        },
        ...baseRegionData,
        id: keypoint.id,
        editingLabels: reviewAnnotation.selected || keypoint.selected,
        highlighted: reviewAnnotation.selected || keypoint.selected,
        tags: [
          getAnnotationLabelOrText(annotation),
          String(index + 1),
          String((annotation as VisionAnnotation<ImageKeypointCollection>).id),
          keypoint.keypoint.label,
        ], // todo: remove once library changes are done to remove tags array usages
        parentAnnotationId: String(
          (annotation as VisionAnnotation<ImageKeypointCollection>).id
        ),
        keypointLabel: keypoint.keypoint.label,
        keypointOrder: String(index + 1),
        keypointConfidence: keypoint.keypoint.confidence,
      } as AnnotatorPointRegion);
    });
  } else {
    console.error('ReactImageAnnotateWrapper: Unknown Annotation type!');
  }
  return regions;
};

/**
 * Converts annotator region to appropriate VisionAnnotation attributes
 *
 * If region is point output is a ReviewKeypoint else it will be an VisionReviewAnnotation with correct data type
 *
 * If annotation metadata is available in the region, output will be a complete review Annotation or review keypoint
 * If not it will be an UnsavedAnnotation or a review keypoint with confidence set to 1
 * @param region
 */
export const convertRegionToVisionAnnotationProperties = (
  region: AnnotatorRegion
): any => {
  const labelOrText =
    region.annotationLabelOrText || (region.tags && region.tags[0]) || ''; // todo: remove reading from tags once library changes are done to remove tags array usages
  let data: VisionAnnotationDataType | ReviewKeypoint | {} = {};

  if (isAnnotatorBoxRegion(region)) {
    switch (region.annotationType) {
      case CDFAnnotationTypeEnum.ImagesAssetLink: {
        data = {
          text: labelOrText,
          textRegion: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
          assetRef: (region.annotation.annotation as ImageAssetLink).assetRef,
        } as ImageAssetLink;
        break;
      }
      case CDFAnnotationTypeEnum.ImagesTextRegion: {
        data = {
          extractedText: labelOrText,
          textRegion: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
        } as ImageExtractedText;
        break;
      }
      default: {
        data = {
          label: labelOrText,
          boundingBox: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
        } as ImageObjectDetectionBoundingBox;
      }
    }
  }
  if (isAnnotatorPolygonRegion(region)) {
    data = {
      label: labelOrText,
      polygon: {
        vertices: region.points.map((point) => ({
          x: point[0],
          y: point[1],
        })),
      },
    } as ImageObjectDetectionPolygon;
  }
  if (isAnnotatorLineRegion(region)) {
    data = {
      label: labelOrText,
      polyline: {
        vertices: [
          { x: region.x1, y: region.y1 },
          { x: region.x2, y: region.y2 },
        ],
      },
    } as ImageObjectDetectionPolyline;
  }
  if (isAnnotatorPointRegion(region)) {
    const keypointLabel =
      region.keypointLabel || (region.tags[3] as AnnotatorKeypointLabel); // todo: remove reading from tags once library changes are done to remove tags array usages
    data = {
      id: region.id,
      keypoint: {
        label: keypointLabel,
        point: { x: region.x, y: region.y },
        confidence: region.keypointConfidence,
      },
      selected: region.editingLabels,
    } as ReviewKeypoint;
  }

  if (isEmpty(data)) {
    console.error('Cannot convert region', JSON.stringify(region));
    return null;
  }

  if (!!region.annotationType && region.annotation) {
    // if point region return keypoint
    if (isAnnotatorPointRegion(region)) {
      return {
        ...data,
      };
    }
    // if annotationType and annotation is available return vision review annotation
    return {
      annotation: {
        ...region.annotation.annotation,
        id: +region.id,
        ...data,
      },
      selected: region.editingLabels,
      show: region.visible,
    } as VisionReviewAnnotation<VisionAnnotationDataType>;
  }

  // if point region return unsaved keypoint
  if (isAnnotatorPointRegion(region)) {
    return {
      ...data,
      confidence: 1,
    };
  }
  // else return vision UnsavedAnnotation
  return {
    data: {
      ...data,
      confidence: 1,
    },
    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
    status: Status.Approved,
    annotatedResourceId: 0,
  } as UnsavedVisionAnnotation<VisionAnnotationDataType>;
};

export const convertUnsavedKeypointCollectionToRegions = (
  keypointCollection: UnsavedKeypointCollection
): AnnotatorRegion[] => {
  const { label, show, selected, annotatedResourceId, reviewKeypoints } =
    keypointCollection;
  return convertVisionReviewAnnotationToRegions({
    annotation: {
      label,
      annotatedResourceId,
      keypoints: reviewKeypoints,
    },
    selected,
    show,
  } as VisionReviewAnnotation<ImageKeypointCollection>);
};
