import {
  AnnotatedResourceId,
  AnnotationStatus,
  CDFAnnotationType,
  CDFAnnotationTypeEnum,
  CDFAnnotationV1,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
  Keypoint,
  Status,
} from 'src/api/annotation/types';
import {
  CDFInheritedFields,
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  isAssetLinkedAnnotation,
  isKeyPointAnnotation,
  isObjectAnnotation,
  isPolygon,
  isPolyline,
  isTextAnnotation,
} from 'src/api/annotation/typeGuards';
import {
  AnnotationCreate,
  AnnotationModel,
  AnnotationPayload,
  AnnotationStatus as sdkAnnotationStatus,
} from '@cognite/sdk-playground';
import {
  validBoundingBox,
  validImageAssetLink,
  validKeypointCollection,
  validPolygon,
  validPolyline,
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

export function convertCDFAnnotationV1ToImageObjectDetectionPolyline(
  annotation: CDFAnnotationV1
): ImageObjectDetectionPolyline | null {
  if (!validPolyline(annotation)) {
    console.warn(conversionWarningMessage('ImageObjectDetectionPolyline'));
    return null;
  }

  const imageObjectDetectionPolyline: ImageObjectDetectionPolyline = {
    label: annotation.text,
    confidence: annotation.data?.confidence,
    polyline: {
      vertices: annotation.region!.vertices,
    },
  };
  return imageObjectDetectionPolyline;
}

export function convertCDFAnnotationV1ToImageExtractedText(
  annotation: CDFAnnotationV1
): ImageExtractedText | null {
  if (!validBoundingBox(annotation)) {
    console.warn(conversionWarningMessage('ImageExtractedText'));
    return null;
  }

  const imageExtractedText: ImageExtractedText = {
    text: annotation.text,
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

  let annotationType: CDFAnnotationType<VisionAnnotationDataType> | null = null;
  if (isAssetLinkedAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageAssetLink(annotation);
    annotationType = CDFAnnotationTypeEnum.ImagesAssetLink;
  } else if (isKeyPointAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageKeypointCollection(annotation);
    annotationType = CDFAnnotationTypeEnum.ImagesKeypointCollection;
  } else if (isTextAnnotation(annotation)) {
    data = convertCDFAnnotationV1ToImageExtractedText(annotation);
    annotationType = CDFAnnotationTypeEnum.ImagesTextRegion;
  } else if (isObjectAnnotation(annotation)) {
    annotationType = CDFAnnotationTypeEnum.ImagesObjectDetection;
    if (isPolygon(annotation)) {
      data = convertCDFAnnotationV1ToImageObjectDetectionPolygon(annotation);
    } else if (isPolyline(annotation)) {
      data = convertCDFAnnotationV1ToImageObjectDetectionPolyline(annotation);
    } else {
      data =
        convertCDFAnnotationV1ToImageObjectDetectionBoundingBox(annotation);
    }
  } else {
    data = convertCDFAnnotationV1ToImageClassification(annotation);
    annotationType = CDFAnnotationTypeEnum.ImagesClassification;
  }
  if (data) {
    const cdfInheritedFields: CDFInheritedFields<VisionAnnotationDataType> = {
      ...annotatedResourceId,
      id: annotation.id,
      createdTime: annotation.createdTime,
      lastUpdatedTime: annotation.lastUpdatedTime,
      status: convertCDFAnnotationV1StatusToStatus(annotation.status),
      annotationType,
    };
    return { ...cdfInheritedFields, ...data };
  }
  return null;
}

export const convertCDFAnnotationToVisionAnnotations = (
  annotations: AnnotationModel[]
): VisionAnnotation<VisionAnnotationDataType>[] =>
  annotations.reduce<VisionAnnotation<VisionAnnotationDataType>[]>(
    (ann, nextAnnotation) => {
      const status = nextAnnotation.status as Status;
      const annotationType =
        nextAnnotation.annotationType as CDFAnnotationType<VisionAnnotationDataType>;

      // if CDF annotation has valid status and annotation type
      if (
        status &&
        annotationType &&
        Object.values(CDFAnnotationTypeEnum).includes(annotationType)
      ) {
        const cdfInheritedFields: CDFInheritedFields<VisionAnnotationDataType> =
          {
            id: nextAnnotation.id,
            createdTime: nextAnnotation.createdTime.getTime(),
            lastUpdatedTime: nextAnnotation.lastUpdatedTime.getTime(),
            status,
            annotatedResourceId: nextAnnotation.annotatedResourceId!, // annotatedResourceId will be mandatory in api soon
            annotationType,
          };

        // HACK: VIS-859 converting Data, due to the type of data of a CDFImageKeypointCollection,
        // is not matching with ImageKeypointCollection data
        // should change Vision internal type and remove this hack - VIS-874
        let annotationData: AnnotationPayload = nextAnnotation.data;
        if (
          cdfInheritedFields.annotationType ===
          CDFAnnotationTypeEnum.ImagesKeypointCollection
        ) {
          const convertedAnnotationData: ImageKeypointCollection = {
            ...(nextAnnotation.data as ImageKeypointCollection),
            keypoints: Object.entries(
              (nextAnnotation.data as ImageKeypointCollection).keypoints
            ).map(([keypointName, keypoint]) => ({
              label: keypointName,
              confidence: (keypoint as Keypoint).confidence,
              point: (keypoint as Keypoint).point,
            })),
          };
          annotationData = convertedAnnotationData;
        }

        const nextVisionAnnotation: VisionAnnotation<VisionAnnotationDataType> =
          {
            ...cdfInheritedFields,
            ...(annotationData as VisionAnnotationDataType),
          };
        return [...ann, nextVisionAnnotation];
      }

      return ann;
    },
    []
  );

// TODO: remove this conversion once
// https://cognitedata.atlassian.net/browse/VIS-874 is done
export const convertUnsavedAnnotationsToCDFCompatibleAnnotation = (
  unsavedAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[]
): Omit<
  AnnotationCreate,
  | 'annotatedResourceType'
  | 'creatingApp'
  | 'creatingAppVersion'
  | 'creatingUser'
>[] =>
  unsavedAnnotations.map((unsavedAnnotation) => {
    const status = unsavedAnnotation.status as sdkAnnotationStatus;

    let annotationData: AnnotationPayload = unsavedAnnotation.data;
    if (
      unsavedAnnotation.annotationType ===
      CDFAnnotationTypeEnum.ImagesKeypointCollection
    ) {
      const keypoints = (
        unsavedAnnotation.data as ImageKeypointCollection
      ).keypoints.reduce((acc, next) => {
        acc[next.label] = {
          point: next.point,
          confidence: next.confidence,
        };
        return acc;
      }, {} as any);

      const convertedAnnotationData = {
        ...unsavedAnnotation.data,
        keypoints,
      };
      annotationData = convertedAnnotationData;
    }

    return {
      ...unsavedAnnotation,
      data: annotationData,
      status,
    };
  });
