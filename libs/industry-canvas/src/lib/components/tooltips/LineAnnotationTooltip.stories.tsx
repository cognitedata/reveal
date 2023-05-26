import { ComponentStory } from '@storybook/react';

import { AnnotationType } from '@cognite/unified-file-viewer';

import { LineAnnotationTooltip } from './LineAnnotationTooltip';

export default {
  title: 'Tooltips/Line Annotation Tooltip Story',
  component: LineAnnotationTooltip,
};

export const LineAnnotationTooltipStory: ComponentStory<
  typeof LineAnnotationTooltip
> = () => {
  return (
    <LineAnnotationTooltip
      lineAnnotation={{
        id: '1',
        type: AnnotationType.POLYLINE,
        style: {
          stroke: 'red',
          strokeWidth: 1,
        },
        vertices: [
          {
            x: 0,
            y: 0,
          },
          {
            x: 1,
            y: 1,
          },
        ],
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
