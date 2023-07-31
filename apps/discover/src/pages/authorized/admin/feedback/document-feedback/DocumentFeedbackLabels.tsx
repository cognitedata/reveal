import * as React from 'react';

import { Label, Flex } from '@cognite/cogs.js';
import { ObjectFeedbackResponse } from '@cognite/discover-api-types';

import { useTranslation } from 'hooks/useTranslation';

import {
  INCORRECT_DOCUMENT_TYPE,
  INCORRECT_GEO_LABEL,
  OTHER,
  SENSITIVE,
} from '../constants';

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
          {t(SENSITIVE)}
        </Label>
      )}
      {feedback.suggestedType && (
        <Label variant="unknown" size="medium">
          {t(INCORRECT_DOCUMENT_TYPE)}
        </Label>
      )}
      {feedback.isIncorrectGeo && (
        <Label variant="unknown" size="medium">
          {t(INCORRECT_GEO_LABEL)}
        </Label>
      )}
      {isOther && (
        <Label variant="unknown" size="medium">
          {t(OTHER)}
        </Label>
      )}
    </Flex>
  );
};
