import React from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from 'components/tmp-label';
import { DocumentFeedbackItem } from 'modules/feedback/types';

import { LabelContainer } from '../elements';

interface Props {
  feedback: DocumentFeedbackItem;
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
    <LabelContainer>
      {feedback.isSensitiveData && (
        <Label color="Danger">{t('Sensitive')}</Label>
      )}
      {feedback.suggestedType && <Label>{t('Incorrect document type')}</Label>}
      {feedback.isIncorrectGeo && <Label>{t('Incorrect geo-Label')}</Label>}
      {isOther && <Label>{t('Other')}</Label>}
    </LabelContainer>
  );
};
