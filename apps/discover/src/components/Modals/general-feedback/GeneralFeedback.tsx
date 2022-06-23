import { sendGeneralFeedback } from 'domain/feedback/internal/actions/sendGeneralFeedback';
import { useFeedbackCreateMutate } from 'domain/feedback/internal/actions/useFeedbackCreateMutate';

import React, { useState } from 'react';

import html2canvas from 'html2canvas';
import { getElementById } from 'utils/general.helper';

import { Modal } from 'components/Modal';
import { showErrorMessage, UndoToast } from 'components/Toast';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';

import { GeneralFeedbackContent } from './GeneralFeedbackContent';

export interface Props {
  visible: boolean;
  onCancel: () => void;
}

export const GeneralFeedbackModal: React.FC<Props> = ({
  visible,
  onCancel,
}) => {
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);

  const metrics = useGlobalMetrics('feedback');

  const { mutateAsync: addCreateFeedback } = useFeedbackCreateMutate('general');

  const { t } = useTranslation();

  const handleTextChange = (value: string) => {
    setError('');
    setComment(value);
  };

  const handleGiveFeedback = () => {
    if (!comment) {
      setError(t('Please provide a comment as your feedback.'));
      return;
    }

    setError('');
    setShowUndoToast(true);
  };

  const handleCancel = () => {
    metrics.track('click-cancel-button');
    onCancel();
  };

  const handleUndo = () => {
    metrics.track('click-undo-button');
    onCancel();
  };

  const sendFeedback = () => {
    metrics.track('click-confirm-button');

    const rootElement = getElementById('root');
    try {
      if (rootElement) {
        html2canvas(rootElement)
          .then((canvas: HTMLCanvasElement) => {
            const base64image = canvas.toDataURL('image/webp', 0.75);
            sendGeneralFeedback(comment, base64image, addCreateFeedback);
          })
          .catch((canvasError: any) => {
            console.error('Error', canvasError);
          });
      }
    } catch (outerException) {
      setError(t('There was an error when sending the feedback.'));
    }

    onCancel();
  };

  if (error !== '') {
    showErrorMessage(error);
  }

  return (
    <>
      <Modal
        visible={!showUndoToast && visible}
        onCancel={handleCancel}
        onOk={handleGiveFeedback}
        okText={t('Send')}
        title={t('Feedback')}
        thirdWidth
      >
        <div data-testid="GeneralFeedback-Container">
          <GeneralFeedbackContent handleTextChange={handleTextChange} />
        </div>
      </Modal>

      <UndoToast
        visible={showUndoToast}
        setVisible={setShowUndoToast}
        callback={sendFeedback}
        onUndo={handleUndo}
      >
        {t(FEEDBACK_CONFIRM_TOAST)}
      </UndoToast>
    </>
  );
};

export default GeneralFeedbackModal;
