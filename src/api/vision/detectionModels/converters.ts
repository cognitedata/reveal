/* eslint-disable no-underscore-dangle */
import {
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  RegionShape,
} from 'src/api/annotation/types';

import {
  GaugeReaderJobAnnotation,
  ObjectDetectionJobAnnotation,
  TagDetectionJobAnnotation,
  TextDetectionJobAnnotation,
  VisionDetectionModelType,
  VisionJobAnnotation,
} from './types';
import {
  validBoundingBox,
  validImageAssetLink,
  validKeypointCollection,
} from './typeValidators';

function conversionWarningMessage(type: string) {
  return `Could not convert annotation in detection model response to ${type}.`;
}

// convert to app internal types
export function convertVisionJobAnnotationToImageClassification(
  visionJobAnnotation: VisionJobAnnotation
) {
  const imageClassification: ImageClassification = {
    label: visionJobAnnotation.text,
    confidence: visionJobAnnotation.confidence,
  };
  return imageClassification;
}

export function convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
  visionJobAnnotation: VisionJobAnnotation
) {
  if (!validBoundingBox(visionJobAnnotation)) {
    console.warn(conversionWarningMessage('ImageObjectDetectionBoundingBox'));
    return null;
  }
  const annotation = visionJobAnnotation as ObjectDetectionJobAnnotation;
  const imageObjectDetectionBoundingBox: ImageObjectDetectionBoundingBox = {
    label: annotation.text,
    confidence: annotation.confidence,
    boundingBox: {
      xMin: annotation.region.vertices[0].x,
      yMin: annotation.region.vertices[0].y,
      xMax: annotation.region.vertices[1].x,
      yMax: annotation.region.vertices[1].y,
    },
  };
  return imageObjectDetectionBoundingBox;
}

export function convertVisionJobAnnotationToImageExtractedText(
  visionJobAnnotation: VisionJobAnnotation
) {
  if (!validBoundingBox(visionJobAnnotation)) {
    console.warn(conversionWarningMessage('ImageExtractedText'));
    return null;
  }
  const annotation = visionJobAnnotation as TextDetectionJobAnnotation;
  const imageExtractedText: ImageExtractedText = {
    extractedText: annotation.text,
    confidence: annotation.confidence,
    textRegion: {
      xMin: annotation.region.vertices[0].x,
      yMin: annotation.region.vertices[0].y,
      xMax: annotation.region.vertices[1].x,
      yMax: annotation.region.vertices[1].y,
    },
  };
  return imageExtractedText;
}

export function convertVisionJobAnnotationToImageAssetLinkList(
  visionJobAnnotation: VisionJobAnnotation
) {
  if (!validImageAssetLink(visionJobAnnotation)) {
    console.warn(conversionWarningMessage('ImageAssetLink'));
    return null;
  }
  const annotation = visionJobAnnotation as TagDetectionJobAnnotation;
  const imageAssetLinkList: ImageAssetLink[] = annotation.assetIds.map(
    (assetId) => {
      return {
        text: annotation.text,
        confidence: annotation.confidence,
        assetRef: { id: assetId },
        textRegion: {
          xMin: annotation.region.vertices[0].x,
          yMin: annotation.region.vertices[0].y,
          xMax: annotation.region.vertices[1].x,
          yMax: annotation.region.vertices[1].y,
        },
      };
    }
  );

  return imageAssetLinkList;
}

export function convertVisionJobAnnotationToImageKeypointCollection(
  visionJobAnnotation: VisionJobAnnotation
) {
  if (!validKeypointCollection(visionJobAnnotation)) {
    console.warn(conversionWarningMessage('ImageKeypointCollection'));
    return null;
  }
  const annotation = visionJobAnnotation as GaugeReaderJobAnnotation;
  const imageKeypointCollection: ImageKeypointCollection = {
    label: annotation.text,
    confidence: annotation.confidence,
    keypoints: annotation.region.vertices.map((item, index) => {
      return {
        point: item,
        label: annotation.data.keypoint_names[index],
        confidence: annotation.confidence,
      };
    }),
  };

  return imageKeypointCollection;
}

// convert to Annotation V1 types
export function convertImageClassificationToAnnotationTypeV1(
  imageClassification: ImageClassification
) {
  const annotation = {
    text: imageClassification.label,
    data: {
      confidence: imageClassification.confidence,
    },
  };

  return annotation;
}

export function convertImageObjectDetectionBoundingBoxToAnnotationTypeV1(
  imageObjectDetectionBoundingBox: ImageObjectDetectionBoundingBox
) {
  const annotation = {
    text: imageObjectDetectionBoundingBox.label,
    data: {
      confidence: imageObjectDetectionBoundingBox.confidence,
    },
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        {
          x: imageObjectDetectionBoundingBox.boundingBox.xMin,
          y: imageObjectDetectionBoundingBox.boundingBox.yMin,
        },
        {
          x: imageObjectDetectionBoundingBox.boundingBox.xMax,
          y: imageObjectDetectionBoundingBox.boundingBox.yMax,
        },
      ],
    },
  };

  return annotation;
}

export function convertImageExtractedTextToAnnotationTypeV1(
  imageExtractedText: ImageExtractedText
) {
  const annotation = {
    text: imageExtractedText.extractedText,
    data: {
      confidence: imageExtractedText.confidence,
    },
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        {
          x: imageExtractedText.textRegion.xMin,
          y: imageExtractedText.textRegion.yMin,
        },
        {
          x: imageExtractedText.textRegion.xMax,
          y: imageExtractedText.textRegion.yMax,
        },
      ],
    },
  };

  return annotation;
}

export function convertImageAssetLinkListToAnnotationTypeV1(
  imageAssetLinkList: ImageAssetLink[]
) {
  const annotations = imageAssetLinkList.map((imageAssetLink) => {
    return {
      text: imageAssetLink.text,
      linkedResourceId: imageAssetLink.assetRef.id,
      linkedResourceExternalId: imageAssetLink.assetRef.externalId,
      linkedResourceType: 'asset',
      data: {
        confidence: imageAssetLink.confidence,
      },
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          {
            x: imageAssetLink.textRegion.xMin,
            y: imageAssetLink.textRegion.yMin,
          },
          {
            x: imageAssetLink.textRegion.xMax,
            y: imageAssetLink.textRegion.yMax,
          },
        ],
      },
    };
  });

  return annotations;
}

export function convertImageKeypointCollectionToAnnotationTypeV1(
  imageKeypointCollection: ImageKeypointCollection
) {
  const annotations = {
    text: imageKeypointCollection.label,
    data: {
      keypoint: true,
      confidence: imageKeypointCollection.confidence,
      keypoints: imageKeypointCollection.keypoints.map((item, index) => {
        return {
          caption: item.label,
          order: (index + 1).toString(), // annotation library (react-image-annotate) has 1-based indexing
        };
      }),
    },
    region: {
      shape: 'points',
      vertices: imageKeypointCollection.keypoints.map((item) => item.point),
    },
  };

  return annotations;
}

export function convertVisionJobAnnotationToAnnotationTypeV1(
  visionJobAnnotation: VisionJobAnnotation,
  visionDetectionModelType: VisionDetectionModelType
) {
  switch (visionDetectionModelType) {
    case VisionDetectionModelType.ObjectDetection: {
      const annotationType =
        convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
          visionJobAnnotation
        );
      return (
        annotationType &&
        convertImageObjectDetectionBoundingBoxToAnnotationTypeV1(annotationType)
      );
    }
    case VisionDetectionModelType.OCR: {
      const annotationType =
        convertVisionJobAnnotationToImageExtractedText(visionJobAnnotation);
      return (
        annotationType &&
        convertImageExtractedTextToAnnotationTypeV1(annotationType)
      );
    }
    case VisionDetectionModelType.TagDetection: {
      const annotationType =
        convertVisionJobAnnotationToImageAssetLinkList(visionJobAnnotation);
      return (
        annotationType &&
        convertImageAssetLinkListToAnnotationTypeV1(annotationType)
      );
    }
    case VisionDetectionModelType.GaugeReader: {
      // Gauge reader output consist of a bounding box and a keypoint collection
      const annotationTypeBoundingBox =
        convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
          visionJobAnnotation
        );
      if (annotationTypeBoundingBox) {
        return convertImageObjectDetectionBoundingBoxToAnnotationTypeV1(
          annotationTypeBoundingBox
        );
      }
      const annotationTypeKeypointCollection =
        convertVisionJobAnnotationToImageKeypointCollection(
          visionJobAnnotation
        );
      return (
        annotationTypeKeypointCollection &&
        convertImageKeypointCollectionToAnnotationTypeV1(
          annotationTypeKeypointCollection
        )
      );
    }
    case VisionDetectionModelType.CustomModel: {
      const annotationTypeBoundingBox =
        convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
          visionJobAnnotation
        );
      if (annotationTypeBoundingBox) {
        return convertImageObjectDetectionBoundingBoxToAnnotationTypeV1(
          annotationTypeBoundingBox
        );
      }

      const annotationTypeClassification =
        convertVisionJobAnnotationToImageClassification(visionJobAnnotation);
      return convertImageClassificationToAnnotationTypeV1(
        annotationTypeClassification
      );
    }
    default:
      return null;
  }
}
