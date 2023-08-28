import { useCallback } from 'react';

import {
  FontSize,
  PolylineEndType,
  isEllipseAnnotation,
  isPolylineAnnotation,
  isRectangleAnnotation,
  isStickyAnnotation,
  isTextAnnotation,
} from '@cognite/unified-file-viewer';

import { CanvasAnnotation, IndustryCanvasToolType } from '../types';
import assertNever from '../utils/assertNever';
import { ExactlyOnePartial } from '../utils/ExactlyOnePartial';

import { UseManagedToolReturnType } from './useManagedTool';
import { UpdateHandlerFn } from './useOnUpdateRequest';

type ShapeAnnotationStyle = {
  fill?: string;
  stroke?: string;
};

type TextAnnotationStyle = {
  fontSize?: FontSize;
  fill?: string;
};

type LineAnnotationStyle = {
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];

  // These are not part of the PolylineAnnotation['style'], but part of the annotation.
  startEndType?: PolylineEndType;
  endEndType?: PolylineEndType;
};

type StickyAnnotationStyle = {
  backgroundColor?: string;
};

type AnnotationStyleByType = {
  shape: ShapeAnnotationStyle;
  text: TextAnnotationStyle;
  line: LineAnnotationStyle;
  sticky: StickyAnnotationStyle;
};

type UseOnUpdateSelectedAnnotationProps = {
  updateStyleForToolType: UseManagedToolReturnType['updateStyleForToolType'];
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onUpdateRequest: UpdateHandlerFn;
};

export type UseOnUpdateSelectedAnnotationReturnType = {
  onUpdateSelectedAnnotation: (
    updatedAnnotationStyle: ExactlyOnePartial<AnnotationStyleByType>
  ) => void;
};

const useOnUpdateSelectedAnnotation = ({
  updateStyleForToolType,
  selectedCanvasAnnotation,
  onUpdateRequest,
}: UseOnUpdateSelectedAnnotationProps): UseOnUpdateSelectedAnnotationReturnType => {
  const onUpdateSelectedAnnotation: UseOnUpdateSelectedAnnotationReturnType['onUpdateSelectedAnnotation'] =
    useCallback(
      (updatedAnnotationStyle) => {
        if (selectedCanvasAnnotation === undefined) {
          console.warn(
            'onUpdateSelectedAnnotation: No annotation selected. This should not happen.'
          );
          return;
        }

        if (updatedAnnotationStyle.shape !== undefined) {
          const updatedStyle = updatedAnnotationStyle.shape;
          updateStyleForToolType({
            [IndustryCanvasToolType.RECTANGLE]: updatedStyle,
          });
          updateStyleForToolType({
            [IndustryCanvasToolType.ELLIPSE]: updatedStyle,
          });

          if (
            !isRectangleAnnotation(selectedCanvasAnnotation) &&
            !isEllipseAnnotation(selectedCanvasAnnotation)
          ) {
            console.warn(
              'onUpdateSelectedAnnotation: No annotation selected, or selected annotation is not a rectangle or ellipse annotation. This should not happen.'
            );
            return;
          }

          onUpdateRequest({
            containers: [],
            annotations: [
              {
                ...selectedCanvasAnnotation,
                style: {
                  ...selectedCanvasAnnotation.style,
                  ...updatedStyle,
                },
              },
            ],
          });
          return;
        }

        if (updatedAnnotationStyle.text !== undefined) {
          const updatedStyle = updatedAnnotationStyle.text;
          updateStyleForToolType({
            [IndustryCanvasToolType.TEXT]: updatedStyle,
          });

          if (!isTextAnnotation(selectedCanvasAnnotation)) {
            console.warn(
              'onUpdateSelectedAnnotation: No annotation selected, or selected annotation is not a text annotation. This should not happen.'
            );
            return;
          }

          onUpdateRequest({
            containers: [],
            annotations: [
              {
                ...selectedCanvasAnnotation,
                style: {
                  ...selectedCanvasAnnotation.style,
                  ...updatedStyle,
                },
              },
            ],
          });
          return;
        }

        if (updatedAnnotationStyle.line !== undefined) {
          const updatedStyle = updatedAnnotationStyle.line;
          updateStyleForToolType({
            [IndustryCanvasToolType.LINE]: updatedStyle,
          });

          if (!isPolylineAnnotation(selectedCanvasAnnotation)) {
            console.warn(
              'onUpdateSelectedAnnotation: No annotation selected, or selected annotation is not a line annotation. This should not happen.'
            );
            return;
          }

          onUpdateRequest({
            containers: [],
            annotations: [
              {
                ...selectedCanvasAnnotation,
                startEndType:
                  updatedStyle.startEndType ??
                  selectedCanvasAnnotation.startEndType,
                endEndType:
                  updatedStyle.endEndType ??
                  selectedCanvasAnnotation.endEndType,
                style: {
                  ...selectedCanvasAnnotation.style,
                  ...updatedStyle,
                },
              },
            ],
          });
          return;
        }

        if (updatedAnnotationStyle.sticky !== undefined) {
          const updatedStyle = updatedAnnotationStyle.sticky;
          updateStyleForToolType({
            [IndustryCanvasToolType.STICKY]: updatedStyle,
          });

          if (!isStickyAnnotation(selectedCanvasAnnotation)) {
            console.warn(
              'onUpdateSelectedAnnotation: No annotation selected, or selected annotation is not a sticky annotation. This should not happen.'
            );
            return;
          }

          onUpdateRequest({
            containers: [],
            annotations: [
              {
                ...selectedCanvasAnnotation,
                style: {
                  ...selectedCanvasAnnotation.style,
                  ...updatedStyle,
                },
              },
            ],
          });
          return;
        }

        assertNever(updatedAnnotationStyle);
      },
      [onUpdateRequest, selectedCanvasAnnotation, updateStyleForToolType]
    );

  return {
    onUpdateSelectedAnnotation,
  };
};

export default useOnUpdateSelectedAnnotation;
