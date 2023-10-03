import { useMemo } from 'react';

import styled from 'styled-components';

import {
  isPolylineAnnotation,
  isTextAnnotation,
  isStickyAnnotation,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';

import { LineAnnotationTooltip } from '../components/tooltips/LineAnnotationTooltip';
import { ShapeAnnotationTooltip } from '../components/tooltips/ShapeAnnotationTooltip';
import { StickyAnnotationTooltip } from '../components/tooltips/StickyAnnotationTooltip';
import { TextAnnotationTooltip } from '../components/tooltips/TextAnnotationTooltip';
import { onDeleteRequest } from '../state/useIndustrialCanvasStore';
import { CanvasAnnotation, isShapeAnnotation } from '../types';

import { UseOnUpdateSelectedAnnotationReturnType } from './useOnUpdateSelectedAnnotation';

export type UseCanvasAnnotationTooltipsParams = {
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
} & UseOnUpdateSelectedAnnotationReturnType;

const useCanvasAnnotationTooltips = ({
  selectedCanvasAnnotation,
  onUpdateSelectedAnnotation,
}: UseCanvasAnnotationTooltipsParams) => {
  return useMemo(() => {
    const onDeleteClick = () => {
      if (selectedCanvasAnnotation === undefined) {
        return;
      }

      onDeleteRequest({
        annotationIds: [selectedCanvasAnnotation.id],
        containerIds: [],
      });
    };
    if (selectedCanvasAnnotation === undefined) {
      return [];
    }

    if (isShapeAnnotation(selectedCanvasAnnotation)) {
      return [
        {
          targetIds: [String(selectedCanvasAnnotation.id)],
          content: (
            <BottomMarginStyle>
              <ShapeAnnotationTooltip
                shapeAnnotation={selectedCanvasAnnotation}
                onDeleteSelectedCanvasAnnotation={onDeleteClick}
                onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
              />
            </BottomMarginStyle>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
          shouldPositionStrictly: true,
        },
      ];
    }

    if (isTextAnnotation(selectedCanvasAnnotation)) {
      return [
        {
          targetIds: [String(selectedCanvasAnnotation.id)],
          content: (
            <BottomMarginStyle>
              <TextAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={onDeleteClick}
                onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
                textAnnotation={selectedCanvasAnnotation}
              />
            </BottomMarginStyle>
          ),
          anchorTo: TooltipAnchorPosition.TOP_LEFT,
          shouldPositionStrictly: true,
        },
      ];
    }

    if (isPolylineAnnotation(selectedCanvasAnnotation)) {
      return [
        {
          targetIds: [String(selectedCanvasAnnotation.id)],
          content: (
            <BottomMarginStyle>
              <LineAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={onDeleteClick}
                onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
                lineAnnotation={selectedCanvasAnnotation}
              />
            </BottomMarginStyle>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
          shouldPositionStrictly: true,
        },
      ];
    }

    if (isStickyAnnotation(selectedCanvasAnnotation)) {
      return [
        {
          targetIds: [String(selectedCanvasAnnotation.id)],
          content: (
            <BottomMarginStyle>
              <StickyAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={onDeleteClick}
                onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
                stickyAnnotation={selectedCanvasAnnotation}
              />
            </BottomMarginStyle>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
          shouldPositionStrictly: true,
        },
      ];
    }

    throw new Error(
      `Unsupported annotation type: ${selectedCanvasAnnotation.type}`
    );
  }, [selectedCanvasAnnotation, onUpdateSelectedAnnotation]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCanvasAnnotationTooltips;
