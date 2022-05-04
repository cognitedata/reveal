import { InternalId, ExternalId, CogniteInternalId } from '@cognite/sdk';
import {
  BoundingBox,
  ImageAssetLink,
  ImageClassification,
  ImageExtractedText,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  Polygon,
  Status,
} from 'src/api/annotation/types';
import { VisionAnnotation } from 'src/modules/Common/types/index';

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
    ...data,
  };
};

export const getDummyImageExtractedTextAnnotation = ({
  id = 1,
  status = Status.Suggested,
  annotatedResourceId = 10,
  extractedText = 'pump',
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
  extractedText?: string;
  confidence?: number;
  textRegion?: BoundingBox;
}): VisionAnnotation<ImageExtractedText> => {
  const data: ImageExtractedText = {
    extractedText,
    confidence,
    textRegion,
  };

  return {
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status,
    annotatedResourceId,
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
    ...data,
  };
};
