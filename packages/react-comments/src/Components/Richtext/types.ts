import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomEditor = BaseEditor & ReactEditor;

type CustomText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
};

export type MentionElement = {
  type: 'mention';
  id: string;
  display: string;
  children: CustomText[];
};

type ParagraphElement = { type: 'paragraph'; children: Descendant[] };

export type CustomElement = MentionElement | ParagraphElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export type CommentData = Descendant[];
