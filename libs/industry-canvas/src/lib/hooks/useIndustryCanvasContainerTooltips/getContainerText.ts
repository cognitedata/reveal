import type { OCRAnnotationPageResult } from '@data-exploration-lib/domain-layer';

import { ContainerType, OCRAnnotation } from '@cognite/unified-file-viewer';

import { IndustryCanvasContainerConfig } from '../../types';

const getTextFromAnnotations = (annotations: OCRAnnotation[]): string =>
  annotations
    .map((a) => a.text)
    .join(' ')
    .trim();

const getContainerText = (
  container: IndustryCanvasContainerConfig,
  ocrData: OCRAnnotationPageResult[] | undefined
): string => {
  if (ocrData === undefined) {
    return '';
  }

  if (ocrData.length === 0) {
    return '';
  }

  if (
    container.type !== ContainerType.DOCUMENT &&
    container.type !== ContainerType.IMAGE
  ) {
    return '';
  }

  if (container.type === ContainerType.DOCUMENT) {
    return getTextFromAnnotations(
      ocrData[(container?.page ?? 1) - 1].annotations
    );
  }

  return getTextFromAnnotations(ocrData[0].annotations);
};

export default getContainerText;
