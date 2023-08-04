import { useEffect, forwardRef, MutableRefObject } from 'react';

import styled from 'styled-components';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { EditorThemeClasses, LexicalEditor } from 'lexical';

import { UserProfile } from '../../UserProfileProvider';

import { MentionNode } from './MentionNode';
import MentionsPlugin from './MentionsPlugin';

const theme: EditorThemeClasses = {
  // Theme styling goes here
  placeholder: 'editor-placeholder',
};

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
  console.error(error);
}

export function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.RefCallback<LexicalEditor> | MutableRefObject<LexicalEditor>;
}): null {
  const [editor] = useLexicalComposerContext();
  if (typeof editorRef === 'function') {
    editorRef(editor);
  } else if (typeof editorRef === 'object') {
    editorRef.current = editor;
  }
  return null;
}

export const CommentEditor = forwardRef(function CommentEditor(
  props: { users: UserProfile[] },
  ref: any
) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [MentionNode],
  };

  return (
    <div style={{ position: 'relative' }}>
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<StyledContentEditable />}
          placeholder={<Placeholder>Write a comment...</Placeholder>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <MentionsPlugin users={props.users} />
        <EditorRefPlugin editorRef={ref} />
      </LexicalComposer>
    </div>
  );
});

const Placeholder = styled.div`
  position: absolute;
  top: 10px;
  left: 15px;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
  color: var(--cogs-text-hint);
`;

const StyledContentEditable = styled(ContentEditable)`
  width: 100%;
  min-height: 80px;
  border-radius: 6px;
  border: 2px solid var(--cogs-border--interactive--default);
  padding: 8px 12px 8px 12px;
`;
