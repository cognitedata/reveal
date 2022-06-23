import { useFeedbackGetOneQuery } from 'domain/feedback/internal/queries/useFeedbackGetOneQuery';

import * as React from 'react';

import styled from 'styled-components/macro';

import { GeneralFeedbackResponse } from '@cognite/discover-api-types';

import { BlankModal } from 'components/Modal';
import { useTranslation } from 'hooks/useTranslation';

const ImagePreview = styled.img`
  max-width: 100%;
`;

interface Props {
  setOpen: (predicate: boolean) => void;
  feedbackId: string;
}
export const GeneralScreenshotModal: React.FC<Props> = ({
  setOpen,
  feedbackId,
}) => {
  const { t } = useTranslation('Admin');

  const { data } = useFeedbackGetOneQuery<GeneralFeedbackResponse>(
    'general',
    feedbackId
  );

  return (
    <BlankModal
      title={t('Screenshot')}
      visible
      onCancel={() => setOpen(false)}
      fullWidth
    >
      <ImagePreview src={data?.screenshotB64} alt="screenshot" />
    </BlankModal>
  );
};
