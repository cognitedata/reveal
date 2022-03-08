/* eslint-disable no-underscore-dangle */
import {
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageObjectDetectionBoundingBox,
  RegionShape,
} from 'src/api/annotation/types';

import {
  ObjectDetectionJobAnnotation,
  TagDetectionJobAnnotation,
  TextDetectionJobAnnotation,
  VisionJobAnnotation,
} from './types';
import { validBoundingBox, validImageAssetLink } from './typeValidators';

function convertionWarningMessage(type: string) {
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
    console.warn(convertionWarningMessage('BoundingBox'));
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
    console.warn(convertionWarningMessage('ImageExtractedText'));
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
    console.warn(convertionWarningMessage('ImageAssetLink'));
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

// convert to Annotation V1 types
export function convertImageClassificationToAnnotationTypeV1(
  imageClassification: ImageClassification
) {
  const annotation = {
    text: imageClassification.label,
    confidence: imageClassification.confidence,
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
