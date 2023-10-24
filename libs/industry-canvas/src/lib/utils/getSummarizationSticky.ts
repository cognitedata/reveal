import {
  Annotation,
  AnnotationType,
  ContainerType,
} from '@cognite/unified-file-viewer';

import { STICKY_ANNOTATION_COLOR_MAP } from '../colors';
import { translationKeys } from '../common';
import { TFunctionType } from '../hooks/useTranslation';
import { SHARED_STICKY_TOOL_OPTIONS } from '../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig } from '../types';

const STICKY_SIZE = 300;

const getContainerSummarizationSticky = (
  containerConfig: IndustryCanvasContainerConfig,
  summary: string,
  isMultiPageDocument: boolean,
  translateFn: TFunctionType
): Annotation => {
  const offset = (2 * STICKY_SIZE) / 3;
  const pageLabel =
    containerConfig.type === ContainerType.DOCUMENT && isMultiPageDocument
      ? translateFn(translationKeys.SUMMARIZATION_STICKY_OF_PAGE, {
          pageNumber: containerConfig.page,
        })
      : '';
  return {
    id: `${containerConfig.id}-summarization-sticky`,
    type: AnnotationType.STICKY,
    x:
      (containerConfig?.x ?? 0) +
      (containerConfig?.width ?? containerConfig.maxWidth ?? 0) -
      offset,
    y: (containerConfig?.y ?? 0) - offset,
    width: STICKY_SIZE,
    height: STICKY_SIZE,
    style: {
      color: SHARED_STICKY_TOOL_OPTIONS.color,
      padding: SHARED_STICKY_TOOL_OPTIONS.padding,
      backgroundColor: STICKY_ANNOTATION_COLOR_MAP.BLUE,
      borderColor: SHARED_STICKY_TOOL_OPTIONS.borderColor,
      borderWidth: SHARED_STICKY_TOOL_OPTIONS.borderWidth,
      borderRadius: SHARED_STICKY_TOOL_OPTIONS.borderRadius,
    },
    text: `${translateFn(
      translationKeys.SUMMARIZATION_STICKY_SUMMARY,
      'Summary'
    )}${pageLabel}: ${summary}`,
  };
};

export default getContainerSummarizationSticky;
