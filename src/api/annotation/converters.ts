import {
  AnnotatedResourceId,
  CDFAnnotationV1,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';
import {
  CDFInheritedFields,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  isAssetLinkedAnnotation,
  isKeyPointAnnotation,
  isObjectAnnotation,
  isPolygon,
  isTextAnnotation,
} from 'src/api/annotation/typeGuards';
import {
  validBoundingBox,
  validImageAssetLink,
  validKeypointCollection,
  validPolygon,
} from './typeValidators';

function conversionWarningMessage(type: string) {
  return `Could not convert annotation in CDF Annotation (V1) response to ${type}.`;
}

export function convertCDFAnnotationV1ToImageClassification(
  annotation: CDFAnnotationV1
): ImageClassification | null {
  if (annotation.region) {
    console.warn(
      'CDFAnnotation with region field converted to ImageClassification ',
      JSON.stringify(annotation)
    );
  }
  if (annotation.text) {
    const imageClassification: ImageClassification = {
      label: annotation.text,
      confidence: annotation.data?.confidence,
    };
    return imageClassification;
  }
  console.warn(conversionWarningMessage('ImageClassification'));
  return null;
}

export function convertCDFAnnotationV1ToImageObjectDetectionBoundingBox(
  annotation: CDFAnnotationV1
): ImageObjectDetectionBoundingBox | null {
  if (!validBoundingBox(annotation)) {
    console.warn(conversionWarningMessage('ImageObjectDetectionBoundingBox'));
    return null;
  }

  const imageObjectDetectionBoundingBox: ImageObjectDetectionBoundingBox = {
    label: annotation.text,
    confidence: annotation.data?.confidence,
    boundingBox: {
      xMin: annotation.region!.vertices[0].x,
      yMin: annotation.region!.vertices[0].y,
      xMax: annotation.region!.vertices[1].x,
      yMax: annotation.region!.vertices[1].y,
    },
  };
  return imageObjectDetectionBoundingBox;
}

export function convertCDFAnnotationV1ToImageObjectDetectionPolygon(
  annotation: CDFAnnotationV1
): ImageObjectDetectionPolygon | null {
  if (!validPolygon(annotation)) {
    console.warn(conversionWarningMessage('ImageObjectDetectionPolygon'));
    return null;
  }

  const imageObjectDetectionPolygon: ImageObjectDetectionPolygon = {
    label: annotation.text,
    confidence: annotation.data?.confidence,
    polygon: {
      vertices: annotation.region!.vertices,
    },
  };
  return imageObjectDetectionPolygon;
}

export function convertCDFAnnotationV1ToImageExtractedText(
  annotation: CDFAnnotationV1
): ImageExtractedText | null {
  if (!validBoundingBox(annotation)) {
    console.warn(conversionWarningMessage('ImageExtractedText'));
    return null;
  }

  const imageExtractedText: ImageExtractedText = {
    extractedText: annotation.text,
    confidence: annotation?.data?.confidence,
    textRegion: {
      xMin: annotation.region!.vertices[0].x,
      yMin: annotation.region!.vertices[0].y,
      xMax: annotation.region!.vertices[1].x,
      yMax: annotation.region!.vertices[1].y,
    },
  };
  return imageExtractedText;
}

export function convertCDFAnnotationV1ToImageAssetLink(
  annotation: CDFAnnotationV1
): ImageAssetLink | null {
  if (!validImageAssetLink(annotation)) {
    console.warn(conversionWarningMessage('ImageAssetLink'));
    return null;
  }
  const imageAssetLink: ImageAssetLink = {
    text: annotation.text,
    confidence: annotation?.data?.confidence,
    assetRef: {
      id: annotation.linkedResourceId!,
      ...(annotation.linkedResourceExternalId && {
        externalId: annotation.linkedResourceExternalId,
      }),
    },
    textRegion: {
      xMin: annotation.region!.vertices[0].x,
      yMin: annotation.region!.vertices[0].y,
      xMax: annotation.region!.vertices[1].x,
      yMax: annotation.region!.vertices[1].y,
    },
  };

  return imageAssetLink;
}

export function convertCDFAnnotationV1ToImageKeypointCollection(
  annotation: CDFAnnotationV1
): ImageKeypointCollection | null {
  if (!validKeypointCollection(annotation)) {
    console.warn(conversionWarningMessage('ImageKeypointCollection'));
    return null;
  }
  const imageKeypointCollection: ImageKeypointCollection = {
    label: annotation.text,
    confidence: annotation.data?.confidence,
    keypoints: annotation.region!.vertices.map((item, index) => ({
      point: item,
      label: annotation.data!.keypoints![index].caption,
      confidence: annotation.data?.confidence,
    })),
  };

  return imageKeypointCollection;
}

export function convertCDFAnnotationV1StatusToStatus(
  annotationStatusV1: AnnotationStatus
): Status {
  if (annotationStatusV1 === AnnotationStatus.Verified) {
    return Status.Approved;
  }
  if (
    annotationStatusV1 === AnnotationStatus.Rejected ||
    annotationStatusV1 === AnnotationStatus.Deleted
  ) {
    return Status.Rejected;
  }
  return Status.Suggested;
}

export function convertCDFAnnotationV1ToVisionAnnotation(
  annotation: CDFAnnotationV1
): VisionAnnotation<VisionAnnotationDataType> | null {
  let data: VisionAnnotationDataType | null = null;
  let annotatedResourceId: AnnotatedResourceId | null = null;

  if (annotation.annotatedResourceId) {
    annotatedResourceId = {
      annotatedResourceId: annotation.annotatedResourceId,
    };
  } else {
    if (annotation.annotatedResourceExternalId) {
      console.error(
        'annotatedResourceExternalId is deprecated. All annotations must contain annotatedResourceId.',
        annotation
      );
    }
    return null;
  }

  const cdfInheritedFields: CDFInheritedFields = {
    ...annotatedResourceId,
    id: annotation.id,
    createdTime: annotation.createdTime,
    lastUpdatedTime: annotation.lastUpdatedTime,
    status: convertCDFAnnotationV1StatusToStatus(annotation.status),
  };

  if (isAssetLinkedAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageAssetLink(annotation);
  } else if (isKeyPointAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageKeypointCollection(annotation);
  } else if (isTextAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageExtractedText(annotation);
  } else if (isObjectAnnotation(annotation)) {
    if (isPolygon(annotation)) {
      data = convertCDFAnnotationV1ToImageObjectDetectionPolygon(annotation);
    } else {
      data =
        convertCDFAnnotationV1ToImageObjectDetectionBoundingBox(annotation);
    }
  } else {
    data = convertCDFAnnotationV1ToImageClassification(annotation);
  }
  if (data) {
    return { ...cdfInheritedFields, ...data };
  }
  return null;
}
