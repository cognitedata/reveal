import * as React from 'react';
import {
  useSelected,
  // useFocused
} from 'slate-react';

import { MentionElement } from './types';

export const MentionInline: React.FC<
  React.PropsWithChildren<{
    attributes?: any;
    element: MentionElement;
  }>
> = ({ attributes, children, element }) => {
  const selected = useSelected();
  // const focused = useFocused();
  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.display.replace(' ', '-')}`}
      style={{
        padding: '1px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '4px',
        color: selected ? '#2b3a88' : 'var(--cogs-link-primary-default)',
        background: selected ? 'rgba(74, 103, 251, 0.1)' : '',
        cursor: 'pointer',
      }}
    >
      {element.display}
      {children}
    </span>
  );
};
