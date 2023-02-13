import { AnnotationType } from '@cognite/unified-file-viewer';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
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
      strokeColor: 'var(--cogs-border--status-neutral--muted)',
      backgroundColor: 'var(--cogs-surface--action--strong--default)',
    };
  if (isPending)
    return {
      strokeColor: 'var(--cogs-border--status-warning--muted)',
      backgroundColor: `var(--cogs-surface--status-warning--strong--default)`,
    };
  if (resourceType === 'asset')
    return {
      strokeColor: 'var(--cogs-border--status-neutral--muted)',
      backgroundColor: 'var(--cogs-surface--status-neutral--strong--default)',
    };
  if (resourceType === 'file')
    return {
      strokeColor: 'var(--cogs-border--status-warning--strong)',
      backgroundColor: 'var(--cogs-surface--status-critical--muted--default)',
    };
  if (resourceType === 'timeSeries')
    return {
      strokeColor: 'var(--cogs-border--status-neutral--muted)',
      backgroundColor: 'var(--cogs-surface--action--strong--default)',
    };
  if (resourceType === 'sequence')
    return {
      strokeColor: 'var(--cogs-border--status-warning--strong)',
      backgroundColor: 'var(--cogs-surface--status-critical--muted--default)',
    };
  if (resourceType === 'event')
    return {
      strokeColor: 'var(--cogs-border--status-neutral--muted)',
      backgroundColor: 'var(--cogs-surface--status-neutral--strong--default)',
    };
  return {
    strokeColor: 'var(--cogs-text-icon--medium)',
    backgroundColor: 'var(--cogs-text-icon--muted)',
  };
};

const DEFAULT_TRACK_USAGE_DEBOUNCE_MS = 300;
export const useDebouncedMetrics = (
  debounceMs = DEFAULT_TRACK_USAGE_DEBOUNCE_MS
) => {
  const trackUsage = useMetrics();
  return useCallback(debounce(trackUsage, debounceMs), [trackUsage]);
};
