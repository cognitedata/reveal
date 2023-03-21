import {
  isPolylineAnnotation,
  isRectangleAnnotation,
  isTextAnnotation,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';
import { useMemo } from 'react';
import styled from 'styled-components';
import { LineAnnotationTooltip } from '../components/tooltips/LineAnnotationTooltip';
import { ShapeAnnotationTooltip } from '../components/tooltips/ShapeAnnotationTooltip';
import { TextAnnotationTooltip } from '../components/tooltips/TextAnnotationTooltip';
import { CanvasAnnotation } from '../types';
import { OnUpdateAnnotationStyleByType } from './useManagedTools';

export type UseCanvasAnnotationTooltipsParams = {
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onDeleteSelectedCanvasAnnotation: () => void;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
};

const useCanvasAnnotationTooltips = ({
  selectedCanvasAnnotation,
  onDeleteSelectedCanvasAnnotation,
  onUpdateAnnotationStyleByType,
}: UseCanvasAnnotationTooltipsParams) => {
  return useMemo(() => {
    if (selectedCanvasAnnotation === undefined) {
      return [];
    }

    if (isRectangleAnnotation(selectedCanvasAnnotation)) {
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
                onUpdateAnnotationStyleByType={onUpdateAnnotationStyleByType}
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
                onUpdateAnnotationStyleByType={onUpdateAnnotationStyleByType}
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
                onUpdateAnnotationStyleByType={onUpdateAnnotationStyleByType}
                lineAnnotation={selectedCanvasAnnotation}
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
    onUpdateAnnotationStyleByType,
    onDeleteSelectedCanvasAnnotation,
  ]);
};

const BottomMarginStyle = styled.div`
  margin-bottom: 10px;
`;

export default useCanvasAnnotationTooltips;
