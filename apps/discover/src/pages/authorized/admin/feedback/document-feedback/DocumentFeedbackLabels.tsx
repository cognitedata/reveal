import React from 'react';
import { useTranslation } from 'react-i18next';

import { Label, Flex } from '@cognite/cogs.js';
import { ObjectFeedbackResponse } from '@cognite/discover-api-types';

interface Props {
  feedback: ObjectFeedbackResponse;
}
export const DocumentFeedbackLabels: React.FC<Props> = ({ feedback }) => {
  const { t } = useTranslation('Admin');

  // Show the "Other" Label when there are no Labels
  const isOther =
    feedback.isOther ||
    !(
      feedback.isSensitiveData ||
      feedback.suggestedType ||
      feedback.isIncorrectGeo
    );

  return (
    <Flex gap={8} wrap="wrap">
      {feedback.isSensitiveData && (
        <Label variant="danger" size="medium">
          {t('Sensitive')}
        </Label>
      )}
      {feedback.suggestedType && (
        <Label variant="unknown" size="medium">
          {t('Incorrect document type')}
        </Label>
      )}
      {feedback.isIncorrectGeo && (
        <Label variant="unknown" size="medium">
          {t('Incorrect geo-Label')}
        </Label>
      )}
      {isOther && (
        <Label variant="unknown" size="medium">
          {t('Other')}
        </Label>
      )}
    </Flex>
  );
};
