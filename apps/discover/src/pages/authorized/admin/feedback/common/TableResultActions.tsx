import { PropsWithChildren } from 'react';

import styled from 'styled-components/macro';

import { BaseButton, CommentButton } from 'components/Buttons';
import { sizes } from 'styles/layout';

import { ActionContainer } from './elements';

export const ActionColumn = styled(ActionContainer)`
  height: unset;
  padding-left: 0px;
  & > * {
    margin-right: ${sizes.normal};
    display: inline-flex;
    align-items: center;
  }
`;

interface prop<FeedbackObject> {
  feedback: FeedbackObject;
  setCommentOpen: (visible: boolean) => void;
  assignFeedback?: (row: FeedbackObject) => void;
  deleteFeedback: (row: FeedbackObject) => void;
}

const TableResultActions = <FeedbackObject extends { id: string }>(
  props: PropsWithChildren<prop<FeedbackObject>>
) => {
  const {
    feedback,
    setCommentOpen,
    assignFeedback,
    deleteFeedback: deleteGeneralFeedback,
  } = props;

  const handleAssignFeedback = () => assignFeedback && assignFeedback(feedback);

  const handleDeleteGeneralFeedback = () => deleteGeneralFeedback(feedback);

  return (
    <ActionColumn>
      <CommentButton onClick={() => setCommentOpen(true)} />

      {assignFeedback && (
        <BaseButton
          icon="User"
          size="small"
          tooltip="Assign to me"
          aria-label="Assign to me"
          data-testid="button-assign-to-me"
          onClick={handleAssignFeedback}
        />
      )}
      <BaseButton
        icon="Archive"
        size="small"
        tooltip="Archive feedback"
        aria-label="Archive feedback"
        data-testid={`button-archive-${feedback.id}`}
        onClick={handleDeleteGeneralFeedback}
      />
    </ActionColumn>
  );
};

export default TableResultActions;
