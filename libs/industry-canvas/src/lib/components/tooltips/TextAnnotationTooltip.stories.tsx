import { AnnotationType } from '@cognite/unified-file-viewer';
import { ComponentStory } from '@storybook/react';
import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { FONT_SIZE } from '../../constants';
import { TextAnnotationTooltip } from './TextAnnotationTooltip';

export default {
  title: 'Tooltips/Text Annotation Tooltip Story',
  component: TextAnnotationTooltip,
};

export const TextAnnotationTooltipStory: ComponentStory<
  typeof TextAnnotationTooltip
> = () => {
  return (
    <TextAnnotationTooltip
      textAnnotation={{
        id: '1',
        type: AnnotationType.TEXT,
        x: 0,
        y: 0,
        style: {
          fontSize: FONT_SIZE['12px'],
          fill: TEXT_ANNOTATION_COLOR_MAP.BLACK,
        },
        text: 'Hello World',
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
