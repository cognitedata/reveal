import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { StoreState } from 'core';

import { Modal } from 'components/modal';
import { UNCLASSIFIED_DOCUMENT_TYPE } from 'components/modals/constants';
import { UndoToast } from 'components/toast';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';
import { useDocument } from 'hooks/useDocument';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';
import {
  sendObjectFeedback,
  useFeedbackCreateMutate,
} from 'modules/api/feedback';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { clearObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { FeedbackState, NewDocumentFeedbackItem } from 'modules/feedback/types';

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
  const [categories, setCategories] = useState<string[]>([
    UNCLASSIFIED_DOCUMENT_TYPE,
  ]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isSensitiveData, setSensitiveData] = useState(false);
  const [isIncorrectGeo, setIncorrectGeo] = useState(false);
  const [isIncorrectDocType, setIncorrectDocType] = useState(false);
  const [correctDocType, setCorrectDocType] = useState('');
  const [isOther, setOther] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [showUndoToast, setShowUndoToast] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(true);

  const { mutateAsync: addObjectFeedback } = useFeedbackCreateMutate('object');

  const { data: allLabels } = useQueryDocumentLabels();

  React.useEffect(() => {
    if (allLabels) {
      setCategories(allLabels.map((label) => label.name));
    }
  }, [JSON.stringify(allLabels)]);

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
        setCorrectDocType('');
        break;
      case 'isOther':
        setOther(value);
        break;
    }
  };

  const handleTextChanged = (event: any) => {
    setFreeText(event.target.value);
  };

  const handleSetCorrectDocumentType = (docType: string) => {
    setCorrectDocType(docType);
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

    const feedback: NewDocumentFeedbackItem = {
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
      feedback.suggestedType = correctDocType;
    }
    sendObjectFeedback(feedback, addObjectFeedback);

    if (isDocumentFeedback && isSensitiveData) {
      dispatch(documentSearchActions.removeSensitiveDocument(documentId));
    }

    handleCloseEvent();
  };

  const handleCloseEvent = () => {
    setSensitiveData(false);
    setIncorrectGeo(false);
    setIncorrectDocType(false);
    setOther(false);
    setFreeText('');
    setCorrectDocType('');
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
