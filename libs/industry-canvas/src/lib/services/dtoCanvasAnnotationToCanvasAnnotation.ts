import { omit, pickBy } from 'lodash';

import {
  AnnotationType,
  EllipseAnnotation,
  PolylineAnnotation,
  RectangleAnnotation,
  TextAnnotation,
} from '@cognite/unified-file-viewer';
import type { StickyAnnotation } from '@cognite/unified-file-viewer';

import { CanvasAnnotation } from '../types';
import assertNever from '../utils/assertNever';

import { DTOCanvasAnnotation } from './types';

export const dtoCanvasAnnotationToCanvasAnnotation = (
  dtoCanvasAnnotation: DTOCanvasAnnotation
): CanvasAnnotation => {
  const { annotationType, properties, ...commonProps } = dtoCanvasAnnotation;
  // Filter out null values from commonProps
  const filteredCommonProps: typeof commonProps = {
    ...pickBy(commonProps, (value) => value !== null),
    id: dtoCanvasAnnotation.id,
    externalId: dtoCanvasAnnotation.externalId,
  };

  if (annotationType === AnnotationType.RECTANGLE) {
    if (properties.x === undefined || properties.y === undefined) {
      throw new Error('x and y must be defined for rectangle annotations');
    }
    if (properties.width === undefined || properties.height === undefined) {
      throw new Error(
        'width and height must be defined for rectangle annotations'
      );
    }
    return {
      ...filteredCommonProps,
      type: AnnotationType.RECTANGLE,
      x: properties.x,
      y: properties.y,
      width: properties.width,
      height: properties.height,
      style: properties.style as RectangleAnnotation['style'],
    };
  }

  if (annotationType === AnnotationType.ELLIPSE) {
    if (properties.x === undefined || properties.y === undefined) {
      throw new Error('x and y must be defined for ellipse annotations');
    }
    if (properties.radius === undefined) {
      throw new Error('radius must be defined for ellipse annotations');
    }
    return {
      ...filteredCommonProps,
      type: AnnotationType.ELLIPSE,
      x: properties.x,
      y: properties.y,
      radius: properties.radius,
      style: properties.style as EllipseAnnotation['style'],
    };
  }

  if (annotationType === AnnotationType.POLYLINE) {
    return {
      ...filteredCommonProps,
      type: AnnotationType.POLYLINE,
      startEndType: properties.startEndType,
      endEndType: properties.endEndType,
      vertices: properties.vertices,
      fromId: properties.fromId,
      toId: properties.toId,
      style: properties.style as PolylineAnnotation['style'],
    };
  }

  if (annotationType === AnnotationType.TEXT) {
    if (properties.x === undefined || properties.y === undefined) {
      throw new Error('x and y must be defined for text annotations');
    }
    if (properties.text === undefined) {
      throw new Error('text must be defined for text annotations');
    }

    const style = properties.style as TextAnnotation['style'];
    if (style.fontSize === undefined) {
      throw new Error('fontSize must be defined for text annotations');
    }
    return {
      ...filteredCommonProps,
      type: AnnotationType.TEXT,
      x: properties.x,
      y: properties.y,
      text: properties.text,
      style,
    };
  }

  if (annotationType === AnnotationType.STICKY) {
    if (properties.x === undefined || properties.y === undefined) {
      throw new Error('x and y must be defined for sticky annotations');
    }
    if (properties.text === undefined) {
      throw new Error('text must be defined for sticky annotations');
    }
    if (properties.width === undefined || properties.height === undefined) {
      throw new Error(
        'width and height must be defined for rectangle annotations'
      );
    }
    return {
      // As per the UFV type for Sticky annotations, stickies are workspace annotations
      ...omit(filteredCommonProps, ['containerId']),
      type: AnnotationType.STICKY,
      text: properties.text,
      x: properties.x,
      y: properties.y,
      width: properties.width,
      height: properties.height,
      style: properties.style as StickyAnnotation['style'],
    };
  }

  if (annotationType === AnnotationType.IMAGE) {
    throw new Error('Image annotation types are not supported yet');
  }

  if (annotationType === AnnotationType.LABEL) {
    throw new Error('Label annotation types are not supported yet');
  }

  assertNever(
    annotationType,
    `Unknown container reference type '${annotationType}' was provided`
  );
};
