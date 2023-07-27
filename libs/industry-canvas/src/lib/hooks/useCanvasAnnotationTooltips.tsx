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
import { CanvasAnnotation, isShapeAnnotation } from '../types';

import { UseOnUpdateSelectedAnnotationReturnType } from './useOnUpdateSelectedAnnotation';

export type UseCanvasAnnotationTooltipsParams = {
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onDeleteSelectedCanvasAnnotation: () => void;
} & UseOnUpdateSelectedAnnotationReturnType;

const useCanvasAnnotationTooltips = ({
  selectedCanvasAnnotation,
  onDeleteSelectedCanvasAnnotation,
  onUpdateSelectedAnnotation,
}: UseCanvasAnnotationTooltipsParams) => {
  return useMemo(() => {
    if (selectedCanvasAnnotation === undefined) {
      return [];
    }

    if (isShapeAnnotation(selectedCanvasAnnotation)) {
      return [
        {
          targetId: String(selectedCanvasAnnotation.id),
          content: (
            <BottomMarginStyle>
              <ShapeAnnotationTooltip
                shapeAnnotation={selectedCanvasAnnotation}
                onDeleteSelectedCanvasAnnotation={
                  onDeleteSelectedCanvasAnnotation
                }
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
          targetId: String(selectedCanvasAnnotation.id),
          content: (
            <BottomMarginStyle>
              <TextAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={
                  onDeleteSelectedCanvasAnnotation
                }
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
          targetId: String(selectedCanvasAnnotation.id),
          content: (
            <BottomMarginStyle>
              <LineAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={
                  onDeleteSelectedCanvasAnnotation
                }
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
          targetId: String(selectedCanvasAnnotation.id),
          content: (
            <BottomMarginStyle>
              <StickyAnnotationTooltip
                onDeleteSelectedCanvasAnnotation={
                  onDeleteSelectedCanvasAnnotation
                }
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
  }, [
    selectedCanvasAnnotation,
    onUpdateSelectedAnnotation,
    onDeleteSelectedCanvasAnnotation,
  ]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCanvasAnnotationTooltips;
