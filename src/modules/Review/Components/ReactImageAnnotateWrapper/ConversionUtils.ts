import {
  AnnotationRegion,
  VisionAPIType,
} from 'src/api/vision/detectionModels/types';
import {
  Box,
  Keypoints,
  Line,
  Point,
  Polygon,
  Region,
} from '@cognite/react-image-annotate';
import { RegionStatus } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import {
  AnnotationStatus,
  KeypointVertex,
  VisionAnnotationRegion,
} from 'src/utils/AnnotationUtils';
import {
  AnnotationTableItem,
  KeypointItemCollection,
} from 'src/modules/Review/types';

export enum RegionTagsIndex {
  label,
  keypointOrder,
  parentAnnotationId,
  keypointLabel,
}

export const convertAnnotations = (
  annotations: VisibleAnnotation[]
): Region[] => {
  let regions: Region[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const annotation of annotations) {
    if (annotation.region?.shape === 'points') {
      const pointRegions = getRegions(annotation.region);

      regions = regions.concat(
        pointRegions.map((pointRegion, index) => ({
          ...annotation,
          highlighted: annotation.selected || pointRegion.editingLabels,
          cls: '',
          locked: false,
          visible: true,
          editingLabels: pointRegion.editingLabels,
          tags: [
            annotation.text,
            String(index + 1),
            String(annotation.id),
            (pointRegion as unknown as KeypointVertex).caption,
          ],
          source: 'user_defined',
          status: AnnotationStatus.Verified,
          ...pointRegion,
        }))
      );
    } else {
      regions.push(convertToRegion(annotation));
    }
  }
  return regions;
};

export const convertToAnnotation = (region: Region): any => {
  return {
    ...region,
    region: convertToAnnotationRegion(region),
    data: { color: region.color },
    text: (region.tags && region.tags[0]) || '',
  };
};

export const convertKeyPointCollectionToAnnotationStub = (
  collection: Required<KeypointItemCollection>
): AnnotationTableItem => {
  return {
    ...collection,
    text: collection.name,
    region: {
      shape: 'points',
      vertices: collection!.keypoints!.map((keypoint) => ({
        ...keypoint,
        x: keypoint!.defaultPosition![0],
        y: keypoint!.defaultPosition![1],
      })),
    },
    data: {
      keypoint: true,
      keypoints: collection.keypoints.map((kPoint) => ({
        caption: kPoint.caption,
        order: kPoint.order,
        color: kPoint.color,
      })),
    },
    annotatedResourceId: 0,
    annotatedResourceType: 'file',
    annotationType: 'user_defined',
    color: '',
    createdTime: 0,
    label: '',
    lastUpdatedTime: 0,
    modelType: VisionAPIType.ObjectDetection,
    show: true,
    source: 'user',
    status: collection.status,
    type: 'points',
  };
};

export const convertCollectionToRegions = (
  collection: Required<KeypointItemCollection>
): Region[] => {
  const regions: Region[] = collection.keypoints.map((keypoint) => ({
    ...collection,
    highlighted: collection.selected,
    cls: '',
    locked: false,
    visible: collection.show,
    editingLabels: keypoint.selected,
    tags: [collection.name, keypoint.order, collection.id, keypoint.caption],
    source: 'vision/objectdetection',
    status: collection.status as RegionStatus,
    color: keypoint.color,
    id: keypoint.id,
    type: 'point',
    x: keypoint.defaultPosition[0],
    y: keypoint.defaultPosition[1],
  }));
  return regions;
};

const convertToRegion = (annotation: VisibleAnnotation): Region => {
  return {
    ...annotation,
    ...getRegions(annotation.region)[0],
    highlighted: annotation.selected,
    cls: '',
    locked: false,
    visible: true,
    editingLabels: annotation.selected,
    tags: [annotation.text],
    // HACK: treat custommodels as object detections
    source:
      annotation.annotationType === 'vision/custommodel'
        ? 'vision/objectdetection'
        : annotation.annotationType,
    status: annotation.status as unknown as RegionStatus,
  };
};

const getRegions = (region?: VisionAnnotationRegion): Region[] => {
  if (region?.shape) {
    switch (region.shape) {
      case 'polygon':
        return [
          {
            type: 'polygon',
            points: region.vertices.map((pt) => [pt.x, pt.y]),
          } as Polygon,
        ];
      case 'points': {
        const pointRegions = region.vertices.map((vertex) => {
          return {
            ...vertex,
            type: 'point',
            x: vertex.x,
            y: vertex.y,
            editingLabels: (vertex as KeypointVertex).selected,
          } as Point;
        });
        return pointRegions;
      }
      case 'rectangle':
        return [
          {
            type: 'box',
            x: region.vertices[0].x,
            y: region.vertices[0].y,
            w: region.vertices[1].x - region.vertices[0].x,
            h: region.vertices[1].y - region.vertices[0].y,
          } as Box,
        ];
      case 'polyline':
        console.error(
          'ReactImageAnnotateWrapper: Polyline cannot be visualized correctly by this viewer!'
        );
        return [
          {
            type: 'line',
            x1: region.vertices[0].x,
            y1: region.vertices[0].y,
            x2: region.vertices[1].x,
            y2: region.vertices[1].y,
          } as Line,
        ];
      default:
        console.error('ReactImageAnnotateWrapper: Unknown Annotation type!');
    }
  }
  return [
    {
      type: 'polygon',
      points: region?.vertices.map((pt) => [pt.x, pt.y]) || [],
    } as Polygon,
  ];
};

const convertToAnnotationRegion = (region: Region): AnnotationRegion => {
  switch (region.type) {
    case 'polygon': {
      const polygon = region as Polygon;
      return {
        shape: 'polygon',
        vertices: polygon.points.map((pt) => ({ x: pt[0], y: pt[1] })),
      };
    }
    case 'point': {
      const point = region as Point;
      return {
        shape: 'points',
        vertices: [{ x: point.x, y: point.y }],
      };
    }
    case 'box': {
      const box = region as Box;
      return {
        shape: 'rectangle',
        vertices: [
          { x: box.x, y: box.y },
          { x: box.x + box.w, y: box.y + box.h },
        ],
      };
    }
    case 'keypoints': {
      const keyPoints = region as Keypoints;
      return {
        shape: 'points',
        vertices: Object.values(keyPoints.points),
      };
    }
    case 'line': {
      const line = region as Line;
      return {
        shape: 'polyline',
        vertices: [
          { x: line.x1, y: line.y1 },
          { x: line.x2, y: line.y2 },
        ],
      };
    }
    default:
      console.error(
        'ReactImageAnnotateWrapper: Cannot convert to Vision Region Type!'
      );
  }
  return {
    shape: 'rectangle',
    vertices: [],
  };
};
