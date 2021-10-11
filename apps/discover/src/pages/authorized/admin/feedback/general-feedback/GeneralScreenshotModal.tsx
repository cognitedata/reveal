import * as React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { BlankModal } from 'components/modal';
import { useFeedbackGetOneQuery } from 'modules/api/feedback';
import { GeneralFeedbackItem } from 'modules/feedback/types';

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

  const { data } = useFeedbackGetOneQuery<GeneralFeedbackItem>(
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
