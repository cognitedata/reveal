import { VisibleAnnotation } from 'src/modules/Review/previewSlice';
import {
  Box,
  Keypoints,
  Line,
  Point,
  Polygon,
  Region,
  RegionStatus,
} from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import { AnnotationRegion } from 'src/api/types';

export const convertToRegion = (annotation: VisibleAnnotation): Region => {
  return {
    ...annotation,
    highlighted: annotation.selected,
    cls: '',
    locked: false,
    visible: true,
    editingLabels: annotation.selected,
    tags: [annotation.text],
    source: annotation.annotationType,
    status: annotation.status as unknown as RegionStatus,
    ...getRegion(annotation.region),
  };
};

export const convertToAnnotation = (region: Region): any => {
  return {
    ...region,
    region: convertToAnnotationRegion(region),
    data: { tags: region.tags, cls: region.cls },
    text: (region.tags && region.tags[0]) || '',
  };
};

const getRegion = (region?: AnnotationRegion): Region => {
  if (region?.shape) {
    switch (region.shape) {
      case 'polygon':
        return {
          type: 'polygon',
          points: region.vertices.map((pt) => [pt.x, pt.y]),
        } as Polygon;
      case 'points':
        return {
          type: 'point',
          x: region.vertices[0].x,
          y: region.vertices[0].y,
        } as Point;
      case 'rectangle':
        return {
          type: 'box',
          x: region.vertices[0].x,
          y: region.vertices[0].y,
          w: region.vertices[1].x - region.vertices[0].x,
          h: region.vertices[1].y - region.vertices[0].y,
        } as Box;
      case 'polyline':
        console.error(
          'ReactImageAnnotateWrapper: Polyline cannot be visualized correctly by this viewer!'
        );
        return {
          type: 'line',
          x1: region.vertices[0].x,
          y1: region.vertices[0].y,
          x2: region.vertices[1].x,
          y2: region.vertices[1].y,
        } as Line;
      default:
        console.error('ReactImageAnnotateWrapper: Unknown Annotation type!');
    }
  }
  return {
    type: 'polygon',
    points: region?.vertices.map((pt) => [pt.x, pt.y]) || [],
  } as Polygon;
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
