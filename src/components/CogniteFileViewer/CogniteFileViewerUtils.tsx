import {
  PendingCogniteAnnotation,
  getPnIDAnnotationType,
} from '@cognite/annotations';
import { Colors } from '@cognite/cogs.js';

export const selectAnnotationColor = <T extends PendingCogniteAnnotation>(
  annotation: T,
  isSelected = false
) => {
  if (isSelected) {
    return Colors.midblue.hex();
  }
  // Assets are purple
  if (annotation.resourceType === 'asset') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['purple-3'].hex();
    }
    return Colors['purple-2'].hex();
  }

  // Files are orange
  if (annotation.resourceType === 'file') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['midorange-3'].hex();
    }
    return Colors['midorange-2'].hex();
  }
  // Undefined are secondary
  return Colors['text-color-secondary'].hex();
};

export const getPnIdAnnotationCategories = <T extends PendingCogniteAnnotation>(
  annotations: T[]
) =>
  annotations.reduce(
    (prev, el) => {
      const type = getPnIDAnnotationType(el);
      if (el.resourceType === 'asset') {
        if (!prev.Asset.items[type]) {
          prev.Asset.items[type] = [];
        }
        prev.Asset.items[type].push(el);
        prev.Asset.count += 1;
      } else if (el.resourceType === 'file') {
        if (!prev.File.items[type]) {
          prev.File.items[type] = [];
        }
        prev.File.items[type].push(el);
        prev.File.count += 1;
      } else {
        if (!prev.Unclassified.items[type]) {
          prev.Unclassified.items[type] = [];
        }
        prev.Unclassified.items[type].push(el);
        prev.Unclassified.count += 1;
      }
      return prev;
    },
    {
      Asset: { items: {}, count: 0 },
      File: { items: {}, count: 0 },
      Unclassified: { items: {}, count: 0 },
    } as {
      [key: string]: {
        items: { [key: string]: T[] };
        count: number;
      };
    }
  );
