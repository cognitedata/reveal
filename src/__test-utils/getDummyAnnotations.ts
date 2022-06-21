import { CogniteInternalId, ExternalId, InternalId } from '@cognite/sdk';
import {
  BoundingBox,
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
  Keypoint,
  Polygon,
  Polyline,
  Status,
} from 'src/api/annotation/types';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  isImageKeypointCollectionData,
  isImageObjectDetectionData,
} from 'src/modules/Common/types/typeGuards';
import { generateKeypointId } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  TurnKeypointType,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';

export const getDummyImageClassificationAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  label = 'pump',
  confidence = 0.5,
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: number;
  label?: string;
  confidence?: number;
}): VisionAnnotation<ImageClassification> => {
  const data: ImageClassification = {
    label,
    confidence,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesClassification,
    ...data,
  };
};

export const getDummyImageObjectDetectionBoundingBoxAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  label = 'pump',
  boundingBox = { xMin: 0.25, yMin: 0.25, xMax: 0.75, yMax: 0.75 },
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  label?: string;
  boundingBox?: BoundingBox;
}): VisionAnnotation<ImageObjectDetectionBoundingBox> => {
  const data: ImageObjectDetectionBoundingBox = {
    label,
    boundingBox,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
    ...data,
  };
};

export const getDummyImageObjectDetectionPolygonAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  label = 'pump',
  confidence = 0.5,
  polygon = {
    vertices: [
      { x: 0.1, y: 0.1 },
      { x: 0.2, y: 0.2 },
      { x: 0.3, y: 0.3 },
    ],
  },
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  label?: string;
  confidence?: number;
  polygon?: Polygon;
}): VisionAnnotation<ImageObjectDetectionPolygon> => {
  const data: ImageObjectDetectionPolygon = {
    label,
    confidence,
    polygon,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
    ...data,
  };
};

export const getDummyImageObjectDetectionPolylineAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  label = 'bar',
  confidence = 0.5,
  polyline = {
    vertices: [
      { x: 0.1, y: 0.1 },
      { x: 0.2, y: 0.2 },
      { x: 0.3, y: 0.3 },
    ],
  },
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  label?: string;
  confidence?: number;
  polyline?: Polyline;
}): VisionAnnotation<ImageObjectDetectionPolyline> => {
  const data: ImageObjectDetectionPolyline = {
    label,
    confidence,
    polyline,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
    ...data,
  };
};

export const getDummyImageKeypointCollectionAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  label = 'gauge',
  confidence = 0.5,
  keypoints = [
    { label: 'start', point: { x: 0.1, y: 0.1 }, confidence: 0.2 },
    { label: 'center', point: { x: 0.2, y: 0.2 }, confidence: 0.2 },
    { label: 'end', point: { x: 0.3, y: 0.3 }, confidence: 0.2 },
  ],
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  label?: string;
  confidence?: number;
  keypoints?: Keypoint[];
}): VisionAnnotation<ImageKeypointCollection> => {
  const data: ImageKeypointCollection = {
    label,
    confidence,
    keypoints,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
    ...data,
  };
};

export const getDummyImageExtractedTextAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  text = 'pump',
  confidence = 0.5,
  textRegion = {
    xMin: 0.25,
    yMin: 0.25,
    xMax: 0.75,
    yMax: 0.75,
  },
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  text?: string;
  confidence?: number;
  textRegion?: BoundingBox;
}): VisionAnnotation<ImageExtractedText> => {
  const data: ImageExtractedText = {
    text,
    confidence,
    textRegion,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
    ...data,
  };
};

export const getDummyImageAssetLinkAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  text = 'pump',
  textRegion = {
    xMin: 0.25,
    yMin: 0.25,
    xMax: 0.75,
    yMax: 0.75,
  },
  assetRef = { id: 123 },
}: {
  id?: number;
  status?: Status;
  annotatedResourceId?: CogniteInternalId;
  text?: string;
  textRegion?: BoundingBox;
  assetRef?: InternalId & Partial<ExternalId>;
}): VisionAnnotation<ImageAssetLink> => {
  const data: ImageAssetLink = {
    text,
    textRegion,
    assetRef,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
    annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
    ...data,
  };
};

export const getDummyVisionReviewAnnotation = (
  annotation: VisionAnnotation<VisionAnnotationDataType>,
  selected?: boolean,
  show?: boolean,
  selectedKeypointIndices?: number[]
): VisionReviewAnnotation<VisionAnnotationDataType> => {
  return {
    annotation: (isImageKeypointCollectionData(annotation)
      ? {
          ...annotation,
          keypoints: annotation.keypoints.map((keypoint, index) => ({
            id: generateKeypointId(annotation.id, keypoint.label),
            keypoint,
            selected: selectedKeypointIndices?.length
              ? selectedKeypointIndices.includes(index)
              : false,
          })),
        }
      : annotation) as TurnKeypointType<
      VisionAnnotation<VisionAnnotationDataType>
    >,
    show: !!show,
    selected: !!selected,
  };
};

export const getDummyUnsavedAnnotation = (
  visionAnnotation: VisionAnnotation<VisionAnnotationDataType>
): UnsavedVisionAnnotation<VisionAnnotationDataType> => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    id,
    annotationType,
    status,
    annotatedResourceId,
    createdTime,
    lastUpdatedTime,
    ...data
  } = visionAnnotation;

  /* eslint-enable @typescript-eslint/no-unused-vars */
  let correctAnnotationType = annotationType;
  if (isImageObjectDetectionData(data)) {
    correctAnnotationType = CDFAnnotationTypeEnum.ImagesObjectDetection;
  }

  return {
    data,
    status,
    annotatedResourceId,
    annotationType: correctAnnotationType,
  } as UnsavedVisionAnnotation<VisionAnnotationDataType>;
};
