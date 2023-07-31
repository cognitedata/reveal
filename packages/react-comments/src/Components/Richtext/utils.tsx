import * as React from 'react';
import ReactDOM from 'react-dom';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import { MentionInline } from './MentionInline';
import { CustomElement, MentionElement } from './types';

export const withMentions = (editor: ReactEditor): ReactEditor => {
  const { isInline, isVoid } = editor;

  // eslint-disable-next-line no-param-reassign
  editor.isInline = (element: CustomElement) => {
    return element.type === 'mention' ? true : isInline(element);
  };

  // eslint-disable-next-line no-param-reassign
  editor.isVoid = (element: CustomElement) => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};

export const insertMention = (
  editor: ReactEditor,
  id: string,
  display: string
) => {
  const mention: MentionElement = {
    type: 'mention',
    id,
    display,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

export const Element: React.FC<any> = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'mention':
      return <MentionInline {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Portal: React.FC<
  React.PropsWithChildren<{ targetId?: string }>
> = ({ children, targetId }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(
        children,
        targetId
          ? document.getElementById(targetId) || document.body
          : document.body
      )
    : null;
};
