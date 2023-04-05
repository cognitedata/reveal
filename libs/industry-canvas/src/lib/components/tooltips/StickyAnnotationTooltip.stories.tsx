import { AnnotationType } from '@cognite/unified-file-viewer';
import { ComponentStory } from '@storybook/react';
import { STICKY_ANNOTATION_COLOR_MAP } from '../../colors';
import { StickyAnnotationTooltip } from './StickyAnnotationTooltip';

export default {
  title: 'Tooltips/Sticky Annotation Tooltip Story',
  component: StickyAnnotationTooltip,
};

export const StickyAnnotationTooltipStory: ComponentStory<
  typeof StickyAnnotationTooltip
> = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}
    >
      <StickyAnnotationTooltip
        stickyAnnotation={{
          id: '1',
          type: AnnotationType.STICKY,
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          style: {
            padding: 4,
            borderRadius: 4,
            borderWidth: 2,
            lineHeight: 1.2,
            shadowColor: 'rgba(79, 82, 104, 0.1)',
            shadowOffset: {
              x: 0,
              y: 1,
            },
            shadowBlur: 16,
            fontSize: '14px',
            color: 'black',
            borderColor: 'rgba(83, 88, 127, 0.24)',
            backgroundColor: STICKY_ANNOTATION_COLOR_MAP.YELLOW,
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
    </div>
  );
};
