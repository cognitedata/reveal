/* eslint-disable no-underscore-dangle */
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from '../../../modules/Common/types';
import {
  isImageAssetLinkData,
  isImageExtractedTextData,
  isImageKeypointCollectionData,
  isImageObjectDetectionData,
} from '../../../modules/Common/types/typeGuards';
import {
  AnnotationAttributes,
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  Status,
} from '../../annotation/types';

import { isLegacyJobResultItem } from './detectionUtils';
import {
  GaugeReaderJobAnnotation,
  LegacyVisionJobResultItem,
  ObjectDetectionJobAnnotation,
  TagDetectionJobAnnotation,
  TextDetectionJobAnnotation,
  VisionDetectionModelType,
  VisionExtractPredictions,
  VisionJobAnnotation,
  VisionJobResultItem,
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
      xMin: Math.min(
        annotation.region.vertices[0].x,
        annotation.region.vertices[1].x
      ),
      yMin: Math.min(
        annotation.region.vertices[0].y,
        annotation.region.vertices[1].y
      ),
      xMax: Math.max(
        annotation.region.vertices[0].x,
        annotation.region.vertices[1].x
      ),
      yMax: Math.max(
        annotation.region.vertices[0].y,
        annotation.region.vertices[1].y
      ),
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
    text: annotation.text,
    confidence: annotation.confidence,
    textRegion: {
      xMin: Math.min(
        annotation.region.vertices[0].x,
        annotation.region.vertices[1].x
      ),
      yMin: Math.min(
        annotation.region.vertices[0].y,
        annotation.region.vertices[1].y
      ),
      xMax: Math.max(
        annotation.region.vertices[0].x,
        annotation.region.vertices[1].x
      ),
      yMax: Math.max(
        annotation.region.vertices[0].y,
        annotation.region.vertices[1].y
      ),
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
          xMin: Math.min(
            annotation.region.vertices[0].x,
            annotation.region.vertices[1].x
          ),
          yMin: Math.min(
            annotation.region.vertices[0].y,
            annotation.region.vertices[1].y
          ),
          xMax: Math.max(
            annotation.region.vertices[0].x,
            annotation.region.vertices[1].x
          ),
          yMax: Math.max(
            annotation.region.vertices[0].y,
            annotation.region.vertices[1].y
          ),
        },
      };
    }
  );

  return imageAssetLinkList;
}

function convertGaugeReaderJobAnnotationAttributesToAnnotationAttributes(
  visionJobAnnotation: GaugeReaderJobAnnotation
): AnnotationAttributes {
  const { data } = visionJobAnnotation;
  return {
    attributes: {
      // TODO: remove unit until it is supported in Annotations API
      // unit: {
      //   type: 'unit',
      //   value: data.unit,
      // },
      gaugeValue: {
        type: 'numerical',
        value: data.gauge_value || -1,
      },
    },
  };
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
    ...convertGaugeReaderJobAnnotationAttributesToAnnotationAttributes(
      annotation
    ),
    keypoints: Object.fromEntries(
      annotation.region.vertices.map((item, index) => [
        annotation.data.keypointNames[index],
        { point: item, confidence: annotation.confidence },
      ])
    ),
  };

  return imageKeypointCollection;
}

export function convertVisionJobResultItemToUnsavedVisionAnnotation(
  visionJobResultItem: LegacyVisionJobResultItem,
  visionDetectionModelType: VisionDetectionModelType
): UnsavedVisionAnnotation<VisionAnnotationDataType>[] {
  const commonProperties = {
    annotatedResourceId: visionJobResultItem.fileId,
    status: Status.Suggested,
  };

  const unsavedVisionAnnotations = !visionJobResultItem.annotations
    ? []
    : visionJobResultItem.annotations
        .map(
          (
            visionJobAnnotation
          ):
            | UnsavedVisionAnnotation<VisionAnnotationDataType>
            | UnsavedVisionAnnotation<VisionAnnotationDataType>[]
            | null => {
            switch (visionDetectionModelType) {
              case VisionDetectionModelType.ObjectDetection: {
                const annotationData =
                  convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
                    visionJobAnnotation
                  );
                return annotationData
                  ? {
                      annotationType:
                        CDFAnnotationTypeEnum.ImagesObjectDetection,
                      data: annotationData,
                      ...commonProperties,
                    }
                  : null;
              }
              case VisionDetectionModelType.OCR: {
                const annotationData =
                  convertVisionJobAnnotationToImageExtractedText(
                    visionJobAnnotation
                  );
                return annotationData
                  ? {
                      annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
                      data: annotationData,
                      ...commonProperties,
                    }
                  : null;
              }
              case VisionDetectionModelType.TagDetection: {
                const annotationData =
                  convertVisionJobAnnotationToImageAssetLinkList(
                    visionJobAnnotation
                  );
                return annotationData
                  ? annotationData.map((item) => ({
                      annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
                      data: item,
                      ...commonProperties,
                    }))
                  : null;
              }
              case VisionDetectionModelType.GaugeReader: {
                // Gauge reader output consist of a bounding box and a keypoint collection

                // to differentiate between Bounding box and keypoint collections
                if (validBoundingBox(visionJobAnnotation)) {
                  const annotationDataBoundingBox =
                    convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
                      visionJobAnnotation
                    );
                  if (annotationDataBoundingBox) {
                    return annotationDataBoundingBox
                      ? {
                          annotationType:
                            CDFAnnotationTypeEnum.ImagesObjectDetection,
                          data: annotationDataBoundingBox,
                          ...commonProperties,
                        }
                      : null;
                  }
                }
                const annotationDataKeypointCollection =
                  convertVisionJobAnnotationToImageKeypointCollection(
                    visionJobAnnotation
                  );
                return annotationDataKeypointCollection
                  ? {
                      annotationType:
                        CDFAnnotationTypeEnum.ImagesKeypointCollection,
                      data: annotationDataKeypointCollection,
                      ...commonProperties,
                    }
                  : null;
              }
              default:
                return null;
            }
          }
        )
        .filter(
          (item): item is UnsavedVisionAnnotation<VisionAnnotationDataType>[] =>
            !!item
        )
        .flat();
  return unsavedVisionAnnotations;
}

export function convertVisionJobResultsToUnsavedVisionAnnotations(
  jobResultItems: VisionJobResultItem[],
  jobType: VisionDetectionModelType
) {
  return jobResultItems
    .map((jobResult) => {
      const commonProperties = {
        annotatedResourceId: jobResult.fileId,
        status: Status.Suggested,
      };
      if (isLegacyJobResultItem(jobResult)) {
        // todo: remove this check once all endpoints moved to annotate service
        const unsavedAnnotationsForFile =
          convertVisionJobResultItemToUnsavedVisionAnnotation(
            jobResult,
            jobType
          );
        return unsavedAnnotationsForFile;
      }

      const allPredictions: VisionExtractPredictions = jobResult.predictions;

      const predictionKeys = Object.keys(
        allPredictions
      ) as (keyof VisionExtractPredictions)[];

      return predictionKeys
        .map((predictionKey) => {
          const visionJobPredictions = allPredictions[predictionKey];

          if (!(visionJobPredictions && visionJobPredictions.length)) {
            return [];
          }

          const unsavedVisionAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[] =
            visionJobPredictions.map(
              (jobPrediction: VisionAnnotationDataType) => {
                if (isImageAssetLinkData(jobPrediction)) {
                  return {
                    annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
                    data: { ...jobPrediction },
                    ...commonProperties,
                  };
                }
                if (isImageExtractedTextData(jobPrediction)) {
                  return {
                    annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
                    data: { ...jobPrediction },
                    ...commonProperties,
                  };
                }
                if (isImageKeypointCollectionData(jobPrediction)) {
                  return {
                    annotationType:
                      CDFAnnotationTypeEnum.ImagesKeypointCollection,
                    data: { ...jobPrediction },
                    ...commonProperties,
                  };
                }
                if (isImageObjectDetectionData(jobPrediction)) {
                  return {
                    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
                    data: { ...jobPrediction },
                    ...commonProperties,
                  };
                }
                return {
                  annotationType: CDFAnnotationTypeEnum.ImagesClassification,
                  data: { ...jobPrediction },
                  ...commonProperties,
                };
              }
            );
          return unsavedVisionAnnotations;
        })
        .reduce((acc, next) => {
          if (next.length) {
            return acc.concat(next);
          }
          return acc;
        }, []);
    })
    .reduce((acc, next) => {
      if (next.length) {
        return acc.concat(next);
      }
      return acc;
    }, []);
}
