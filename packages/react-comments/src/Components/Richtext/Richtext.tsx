// @refresh reset
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Editor, Transforms, Range, createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, ReactEditor, withReact } from 'slate-react';
import { Button } from '@cognite/cogs.js';

import { UserList } from './UserList';
import { CommentData } from './types';
import { ActionButtons } from './elements';
import { Portal, Element, withMentions, insertMention } from './utils';

export interface RichtextProps {
  disableAutoPosition?: boolean;
  editMode?: boolean;
  readOnly?: boolean;
  zIndex?: number;
  placeholder?: string;
  actionTarget?: string;
  userManagementServiceBaseUrl?: string;
  onPostMessage?: (message: CommentData) => void;
  handleCancel?: () => void;
  initialValue?: CommentData;
  fasAppId?: string;
  idToken?: string;
}
/*
 * This is heavily based from: https://github.com/ianstormtaylor/slate/blob/main/site/examples/mentions.tsx
 *
 * See the slate docs for more info.
 */
export const Richtext: React.FC<RichtextProps> = ({
  disableAutoPosition,
  editMode,
  onPostMessage,
  handleCancel,
  readOnly,
  actionTarget,
  zIndex = 3,
  placeholder = 'Write a comment...',
  userManagementServiceBaseUrl,
  fasAppId,
  idToken,
  initialValue = [
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
}) => {
  const ref = React.useRef<HTMLDivElement | null>();
  const [value, setValue] = React.useState<Descendant[]>(initialValue);
  const [target, setTarget] = React.useState<Range | undefined>();
  const [index, setIndex] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const renderElement = React.useCallback(
    (props) => <Element {...props} />,
    []
  );
  const editor = React.useMemo(
    () => withMentions(withReact(withHistory(createEditor() as ReactEditor))),
    []
  );

  const isSearching = search.toLowerCase().length > 0;

  const handleSelect = (id: string, display: string) => () => {
    if (target) {
      // clears previous value
      Transforms.select(editor, target);
    }
    insertMention(editor, id, display);
  };

  const onKeyDown = React.useCallback(
    (event) => {
      if (target) {
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            setTarget(undefined);
            break;
        }
      }
    },
    [index, search, target]
  );

  React.useEffect(() => {
    if (disableAutoPosition) {
      return;
    }

    if (target && isSearching) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [isSearching, editor, index, search, target]);

  const handlePost = (message: CommentData) => {
    if (onPostMessage) {
      onPostMessage(message);
    }
    setValue(initialValue);
  };

  const showActionButtons = onPostMessage && !isEqual(value, initialValue);
  const showUserList = target && userManagementServiceBaseUrl;

  // console.log('Render gates:', {
  //   showUserList,
  //   showActionButtons,
  // });

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.string(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.string(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            setIndex(0);
            return;
          }
        }

        setTarget(undefined);
      }}
    >
      <Editable
        renderElement={renderElement}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        data-testid="editable-area"
      />

      {showActionButtons && (
        <Portal targetId={actionTarget}>
          <ActionButtons>
            <Button
              type="ghost"
              className="cogs-comment--cancel-button"
              onClick={() => {
                setValue(initialValue);
                if (handleCancel) {
                  handleCancel();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="cogs-comment--send-button"
              onClick={() => handlePost(value)}
            >
              {editMode ? 'Save' : 'Send'}
            </Button>
          </ActionButtons>
        </Portal>
      )}

      {showUserList && userManagementServiceBaseUrl && (
        <Portal>
          <div
            // @ts-expect-error ref type issue?
            ref={ref}
            style={{
              position: 'absolute',
              zIndex,
            }}
            data-cy="mentions-portal"
          >
            <UserList
              userManagementServiceBaseUrl={userManagementServiceBaseUrl}
              search={search.toLowerCase()}
              onSelect={handleSelect}
              fasAppId={fasAppId}
              idToken={idToken}
            />
          </div>
        </Portal>
      )}
    </Slate>
  );
};
