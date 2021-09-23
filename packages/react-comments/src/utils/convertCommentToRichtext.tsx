import { MessageType } from '@cognite/cogs.js';

import { CommentData, Richtext } from '../Components/Richtext';
import { ExtendedMessageType } from '../types';
import { EditTextarea } from '../Components/Richtext/elements';

import { getSlateCommentValue } from './getSlateCommentValue';

export const getRichtext = (value: string) => (
  <Richtext readOnly initialValue={getSlateCommentValue(value)} />
);

export const convertCommentToRichtext = (
  comment: MessageType
): ExtendedMessageType => {
  return {
    ...comment,
    rawText: comment.text as string,
    text: getRichtext(comment.text as string),
  };
};

export const convertCommentToRichtextEditable = ({
  comment,
  handleSaveMessage,
  handleCancel,
  userManagementServiceBaseUrl,
}: {
  comment: ExtendedMessageType;
  handleSaveMessage: (message: CommentData) => void;
  handleCancel: () => void;
  userManagementServiceBaseUrl?: string;
}): MessageType => {
  const editActionButtonsTarget = 'edit-comment-buttons';
  return {
    ...comment,
    text: (
      <EditTextarea>
        <div className="cogs-comment">
          <div className="cogs-textarea">
            <div className="cogs-textarea--content-editable">
              <Richtext
                editMode
                handleCancel={handleCancel}
                onPostMessage={handleSaveMessage}
                actionTarget={editActionButtonsTarget}
                userManagementServiceBaseUrl={userManagementServiceBaseUrl}
                initialValue={getSlateCommentValue(
                  comment.rawText || comment.text
                )}
              />
            </div>
          </div>
        </div>
        <div id={editActionButtonsTarget} />
      </EditTextarea>
    ),
  };
};
