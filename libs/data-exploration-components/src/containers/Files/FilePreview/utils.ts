import chroma from 'chroma-js';

import { Colors } from '@cognite/cogs.js';
import { AnnotationType } from '@cognite/unified-file-viewer';

import { ExtendedAnnotation, ResourceType } from '@data-exploration-lib/core';

import { getResourceTypeFromExtendedAnnotation } from './migration/utils';

export const getContainerId = (fileId: number) => {
  return String(fileId);
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

  const colors = getResourceTypeAnnotationColor(
    getResourceTypeFromExtendedAnnotation(annotation),
    isSelected,
    isPending
  );

  return {
    ...annotation,
    isDraggable: false,
    isResizable: false,
    isSelectable: false,
    style: {
      ...(annotation.style || {}),
      strokeWidth: 2,
      stroke: colors.strokeColor,
      // transparent shapes don't register clicks in UFV
      fill: isHover
        ? colors.backgroundColor
        : chroma(colors.backgroundColor).alpha(0.01).css(),
      ...(isSelected && { dash: [4, 4] }),
    },
  };
};

const getRGBA = (rgbString: string, alpha: number): string => {
  return rgbString.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
};

export const getResourceTypeAnnotationColor = (
  resourceType?: ResourceType,
  isSelected = false,
  isPending = false
): {
  strokeColor: string;
  backgroundColor: string;
} => {
  if (isSelected)
    return {
      strokeColor: Colors['border--interactive--toggled-pressed'],
      backgroundColor: getRGBA(
        Colors['border--interactive--toggled-pressed'],
        0.1
      ),
    };

  if (isPending)
    return {
      strokeColor: Colors['decorative--yellow--400'],
      backgroundColor: getRGBA(Colors['decorative--yellow--400'], 0.2),
    };

  if (resourceType === 'asset')
    return {
      strokeColor: Colors['decorative--purple--400'],
      backgroundColor: getRGBA(Colors['decorative--purple--400'], 0.2),
    };
  if (resourceType === 'file')
    return {
      strokeColor: Colors['decorative--orange--400'],
      backgroundColor: getRGBA(Colors['decorative--orange--400'], 0.2),
    };
  if (resourceType === 'timeSeries')
    return {
      strokeColor: Colors['decorative--blue--300'],
      backgroundColor: getRGBA(Colors['decorative--blue--300'], 0.2),
    };
  if (resourceType === 'sequence')
    return {
      strokeColor: Colors['decorative--yellow--300'],
      backgroundColor: getRGBA(Colors['decorative--yellow--300'], 0.2),
    };
  if (resourceType === 'event')
    return {
      strokeColor: Colors['decorative--pink--400'],
      backgroundColor: getRGBA(Colors['decorative--pink--400'], 0.2),
    };

  return {
    strokeColor: Colors['decorative--grayscale--700'],
    backgroundColor: getRGBA(Colors['decorative--grayscale--700'], 0.2),
  };
};

const SEARCH_RESULT_COLOR = Colors['decorative--yellow--400'];
const HIGHLIGHTED_SEARCH_RESULT_COLOR = Colors['decorative--orange--400'];
export const getSearchResultAnnotationStyle = (isHighlighted: boolean) => {
  if (isHighlighted) {
    return {
      stroke: getRGBA(HIGHLIGHTED_SEARCH_RESULT_COLOR, 0.8),
      fill: getRGBA(HIGHLIGHTED_SEARCH_RESULT_COLOR, 0.4),
      strokeWidth: 1.5,
    };
  }
  return {
    stroke: getRGBA(SEARCH_RESULT_COLOR, 0.8),
    fill: getRGBA(SEARCH_RESULT_COLOR, 0.4),
    strokeWidth: 1,
  };
};
