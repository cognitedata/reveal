import React from 'react';

import { Button } from '@cognite/cogs.js';
import { GeneralFeedbackResponse } from '@cognite/discover-api-types';

import { useTranslation } from 'hooks/useTranslation';

import { useFeedback } from '../../Selector';

export const ScreenshotColumn: React.FC<{
  feedbackRow: GeneralFeedbackResponse;
  setSelectedFeedback: (row: GeneralFeedbackResponse) => void;
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
