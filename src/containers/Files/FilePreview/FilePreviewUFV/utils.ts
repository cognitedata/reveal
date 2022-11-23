import { CogniteAnnotation } from '@cognite/annotations';
import { Colors } from '@cognite/cogs.js';
import {
  AnnotationType,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { getResourceTypeFromExtendedAnnotation } from './migration/utils';
import { ExtendedAnnotation } from './types';

export const getContainerId = (fileId: number) => {
  return String(fileId);
};
export const convertUFVAnnotationToLegacyCogniteAnnotation = (
  annotation: RectangleAnnotation,
  label: string
): CogniteAnnotation => {
  return {
    createdTime: new Date(),
    label,
    lastUpdatedTime: new Date(),
    source: '',
    status: 'unhandled',
    version: 0,
    id: +annotation.id,
    type: 'asset',
    box: {
      xMax: annotation.x + annotation.width,
      xMin: annotation.x,
      yMax: annotation.y + annotation.height,
      yMin: annotation.y,
    },
  };
};

export const getStyledAnnotationFromAnnotation = (
  annotation: ExtendedAnnotation,
  isSelected = false,
  isPending: boolean,
  isHover: boolean
): ExtendedAnnotation => {
  if (annotation.type !== AnnotationType.RECTANGLE) {
    throw new Error('Unsupported annotation type');
  }

  const colors = selectAnnotationColors(
    annotation,
    isSelected,
    isPending,
    getResourceTypeFromExtendedAnnotation(annotation)
  );

  return {
    ...annotation,
    style: {
      ...(annotation.style || {}),
      strokeWidth: 2,
      stroke: colors.strokeColor,
      fill: isHover ? colors.backgroundColor : 'transparent',
      ...(isSelected && { dash: [4, 4] }),
    },
  };
};

export const selectAnnotationColors = (
  annotation: ExtendedAnnotation,
  isSelected = false,
  isPending = false,
  resourceType?: string
): { strokeColor: string; backgroundColor: string } => {
  if (isSelected)
    return {
      strokeColor: Colors['lightblue-1'].hex(),
      backgroundColor: `${Colors.lightblue.hex()}11`,
    };
  if (isPending)
    return {
      strokeColor: Colors['yellow-1'].hex(),
      backgroundColor: `${Colors['yellow-1'].hex()}33`,
    };
  if (resourceType === 'asset')
    return {
      strokeColor: Colors['purple-3'].hex(),
      backgroundColor: `${Colors['purple-3'].hex()}33`,
    };
  if (resourceType === 'file')
    return {
      strokeColor: Colors['midorange-3'].hex(),
      backgroundColor: `${Colors['midorange-3'].hex()}33`,
    };
  if (resourceType === 'timeSeries')
    return {
      strokeColor: Colors['lightblue-3'].hex(),
      backgroundColor: `${Colors['lightblue-3'].hex()}33`,
    };
  if (resourceType === 'sequence')
    return {
      strokeColor: Colors['yellow-3'].hex(),
      backgroundColor: `${Colors['yellow-3'].hex()}33`,
    };
  if (resourceType === 'event')
    return {
      strokeColor: Colors['pink-3'].hex(),
      backgroundColor: `${Colors['pink-3'].hex()}33`,
    };
  return {
    strokeColor: Colors['text-color-secondary'].hex(),
    backgroundColor: `${Colors['text-color-secondary'].hex()}33`,
  };
};
