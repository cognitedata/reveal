import { useDocument } from 'domain/documents/internal/hooks/useDocument';
import { useDocumentLabelsByExternalIds } from 'domain/documents/internal/hooks/useDocumentLabels';
import { useQueryDocumentLabels } from 'domain/documents/service/queries/useDocumentQuery';
import { sendObjectFeedback } from 'domain/feedback/internal/actions/sendObjectFeedback';
import { useFeedbackCreateMutate } from 'domain/feedback/internal/actions/useFeedbackCreateMutate';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { StoreState } from 'core';

import { ObjectFeedback } from '@cognite/discover-api-types';

import { Modal } from 'components/Modal';
import { UndoToast } from 'components/Toast';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';
import { clearObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { useRemoveSensitiveDocument } from 'modules/feedback/hooks/useRemoveSensitiveDocument';
import { FeedbackState } from 'modules/feedback/types';

import { EntityFeedbackContent } from './EntityFeedbackContent';
import { Field } from './types';
import { getDerivedState } from './utils';

export const EntityFeedback = () => {
  const documentId = useSelector<
    StoreState,
    FeedbackState['objectFeedbackModalDocumentId']
  >((state) => state.feedback.objectFeedbackModalDocumentId);

  if (!documentId) return null;

  return <EntityFeedbackModal documentId={documentId} />;
};

interface Props {
  documentId: string;
}

export const EntityFeedbackModal: React.FC<Props> = ({ documentId }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isSensitiveData, setSensitiveData] = useState(false);
  const [isIncorrectGeo, setIncorrectGeo] = useState(false);
  const [isIncorrectDocType, setIncorrectDocType] = useState(false);
  const [correctDocType, setCorrectDocType] = useState({
    label: '',
    value: '',
  });
  const [isOther, setOther] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(true);

  const { mutateAsync: addObjectFeedback } = useFeedbackCreateMutate('object');
  const removeSensitiveDocument = useRemoveSensitiveDocument();

  const { data: categories } = useQueryDocumentLabels();

  const [doc] = useDocument(documentId);

  const handleClose = () => {
    dispatch(clearObjectFeedbackModalDocumentId());
  };

  const handleCheckChanged = (field: Field, value: boolean) => {
    switch (field) {
      case 'isSensitiveData':
        setSensitiveData(value);
        break;
      case 'isIncorrectGeo':
        setIncorrectGeo(value);
        break;
      case 'isIncorrectDocType':
        setIncorrectDocType(value);
        setCorrectDocType({ label: '', value: '' });
        break;
      case 'isOther':
        setOther(value);
        break;
    }
  };

  const handleTextChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFreeText(event.target.value);
  };

  const handleSetCorrectDocumentType = (event: {
    label: string;
    value?: string;
  }) => {
    setCorrectDocType({ ...event, value: event.value || '' });
  };

  const handleSendClick = () => {
    setShowModal(false);
    setShowUndoToast(true);
  };

  const filteredLabels = useDocumentLabelsByExternalIds(doc?.doc.labels || []);

  const currentDocumentType = filteredLabels[0];

  const sendFeedback = () => {
    const isDocumentTypeFeedback = isIncorrectDocType;
    const isDocumentFeedback =
      freeText || isIncorrectGeo || isOther || isSensitiveData;

    const feedback: ObjectFeedback = {
      comment: freeText,
      isIncorrectGeo,
      isOther,
      isSensitiveData,
      documentId,
      documentExternalId: doc?.externalId,
      originalType: filteredLabels.join(', '),
      fileName: doc?.doc.filename,
      fileLocation: doc?.doc.filepath || '',
    };

    if (isDocumentTypeFeedback) {
      feedback.suggestedType = correctDocType.label;
      feedback.suggestedTypeLabelId = correctDocType.value;
    }
    sendObjectFeedback(feedback, addObjectFeedback);

    if (isDocumentFeedback && isSensitiveData) {
      removeSensitiveDocument(documentId);
    }

    handleCloseEvent();
  };

  const handleCloseEvent = () => {
    setSensitiveData(false);
    setIncorrectGeo(false);
    setIncorrectDocType(false);
    setOther(false);
    setFreeText('');
    setCorrectDocType({ label: '', value: '' });
    handleClose();
  };

  const { isAnyFeedbackTypeExist } = getDerivedState({
    isIncorrectDocType,
    correctDocType,
    isSensitiveData,
    isIncorrectGeo,
    isOther,
    freeText,
  });

  return (
    <>
      <Modal
        onOk={handleSendClick}
        okText={t('Send')}
        okDisabled={!isAnyFeedbackTypeExist}
        visible={showModal}
        onCancel={handleCloseEvent}
        title={t('Feedback')}
        width={640}
      >
        <EntityFeedbackContent
          handleCheckChanged={handleCheckChanged}
          isSensitiveData={isSensitiveData}
          isIncorrectGeo={isIncorrectGeo}
          isIncorrectDocType={isIncorrectDocType}
          isOther={isOther}
          handleSetCorrectDocumentType={handleSetCorrectDocumentType}
          handleTextChanged={handleTextChanged}
          documentTypes={categories}
          currentDocumentType={currentDocumentType}
          freeText={freeText}
        />
      </Modal>
      <UndoToast
        visible={showUndoToast}
        setVisible={setShowUndoToast}
        callback={sendFeedback}
        onUndo={handleCloseEvent}
      >
        {t(FEEDBACK_CONFIRM_TOAST)}
      </UndoToast>
    </>
  );
};

export default EntityFeedback;
