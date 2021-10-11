import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';

import { GeneralFeedbackItem } from 'modules/feedback/types';

import { useFeedback } from '../../Selector';

export const ScreenshotColumn: React.FC<{
  feedbackRow: GeneralFeedbackItem;
  setSelectedFeedback: (row: GeneralFeedbackItem) => void;
  setOpen: (value: boolean) => void;
}> = (props) => {
  const { feedbackRow, setSelectedFeedback, setOpen } = props;
  const { t } = useTranslation();

  const { generalFeedbackShowDeleted } = useFeedback();

  return (
    <Button
      aria-label="Screenshot"
      size="small"
      onClick={(event) => {
        if (!generalFeedbackShowDeleted) {
          setOpen(true);
          setSelectedFeedback(feedbackRow);
        }
        event.stopPropagation();
      }}
    >
      {t('Screenshot')}
    </Button>
  );
};
