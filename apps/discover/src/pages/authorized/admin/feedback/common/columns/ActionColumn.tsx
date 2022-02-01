import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';

import { Tooltip } from 'components/tooltip';

import TableResultActions from '../TableResultActions';

interface prop<FeedbackObject extends { id: string }> {
  feedbackRow: FeedbackObject;
  showDeleted: boolean;
  setSelectedFeedback: (row: FeedbackObject) => void;
  setCommentOpen: (value: boolean) => void;
  recoverFeedback: (row: FeedbackObject) => void;
  assignFeedback?: (row: FeedbackObject) => void;
  deleteGeneralFeedback: (row: FeedbackObject) => void;
}

export const ActionColumn = <FeedbackObject extends { id: string }>(
  props: PropsWithChildren<prop<FeedbackObject>>
) => {
  const {
    feedbackRow,
    showDeleted,
    setSelectedFeedback,
    setCommentOpen,
    recoverFeedback,
    assignFeedback,
    deleteGeneralFeedback,
  } = props;

  const { t } = useTranslation();

  const handleRecoverFeedback = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    recoverFeedback(feedbackRow);
  };

  const deletedActionColumn = () => {
    return (
      <Tooltip title={t('Recover feedback')} placement="bottom">
        <Button
          variant="ghost"
          data-testid="button-recover"
          onClick={handleRecoverFeedback}
        >
          {t('Revert')}
        </Button>
      </Tooltip>
    );
  };

  if (showDeleted) return deletedActionColumn();

  return (
    <TableResultActions
      feedback={feedbackRow}
      setCommentOpen={(value) => {
        setSelectedFeedback(feedbackRow);
        setCommentOpen(value);
      }}
      assignFeedback={assignFeedback}
      deleteFeedback={deleteGeneralFeedback}
    />
  );
};
