import { ComponentStory } from '@storybook/react';

import { AnnotationType } from '@cognite/unified-file-viewer';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
} from '../../colors';

import { ShapeAnnotationTooltip } from './ShapeAnnotationTooltip';

export default {
  title: 'Tooltips/Shape Annotation Tooltip Story',
  component: ShapeAnnotationTooltip,
};

export const ShapeAnnotationTooltipStory: ComponentStory<
  typeof ShapeAnnotationTooltip
> = () => {
  return (
    <ShapeAnnotationTooltip
      shapeAnnotation={{
        id: '1',
        type: AnnotationType.RECTANGLE,
        style: {
          fill: SHAPE_ANNOTATION_FILL_COLOR_MAP.RED,
          stroke: SHAPE_ANNOTATION_STROKE_COLOR_MAP.ORANGE,
          strokeWidth: 1,
        },
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      }}
      onDeleteSelectedCanvasAnnotation={() => {
        console.log('onDeleteSelectedCanvasAnnotation');
      }}
      onUpdateAnnotationStyleByType={(prop) => {
        console.log('onUpdateAnnotationStyleByType, prop:', prop);
      }}
    />
  );
};
