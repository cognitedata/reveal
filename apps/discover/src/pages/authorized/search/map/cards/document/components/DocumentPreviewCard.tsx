import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { openDocumentPreviewInNewTab } from 'services/documentPreview/utils';
import { handleServiceError } from 'utils/errors';
import { getPathsFromDoc } from 'utils/getPathsFromDocument';

import { useTranslation } from '@cognite/react-i18n';

import BasePreviewCard from 'components/card/preview-card/BasePreviewCard';
import {
  FilePath,
  DocumentViewModal,
  Metadata,
  Url,
  Highlight,
} from 'components/document-preview';
import { showSuccessMessage } from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';
import { clearSelectedDocument } from 'modules/map/actions';
import { MarginBottomNormalContainer } from 'styles/layout';

import { DocumentPreviewActions } from './DocumentPreviewActions';
import { DocumentInfoWrapper } from './elements';

export const DocumentPreviewCard: React.FC<{
  documentId: string;
  onPopupClose?: () => void;
}> = ({ documentId, onPopupClose }) => {
  const metrics = useGlobalMetrics('map');
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const documentResultHits = useDocumentResultHits();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const handlePreviewClick = async () => {
    setShowModal(true);
    metrics.track('click-open-document-preview-button');
  };

  useEffect(() => {
    setTimeout(() => {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }, [documentId]);

  const doc = useMemo(
    () => documentResultHits.find((doc) => doc.id === documentId),
    [documentId]
  );

  const viewDocumentInNewTab = async () => {
    metrics.track('click-view-document-in-tab-button');

    setDownloadingPdf(true);
    showSuccessMessage(t('Retrieving document'));

    if (doc && doc.doc.id) {
      openDocumentPreviewInNewTab(doc.doc.id)
        .catch(handleServiceError)
        .finally(() => {
          setDownloadingPdf(false);
        });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    metrics.track('click-close-document-preview-button');
  };

  const handlePreviewClose = () => {
    dispatch(clearSelectedDocument());

    if (onPopupClose) {
      onPopupClose();
    }
  };

  if (!doc) return null;

  const fileName = doc.doc.filename;

  return (
    <BasePreviewCard
      title={fileName}
      handleCloseClick={handlePreviewClose}
      actions={
        <DocumentPreviewActions
          doc={doc}
          handlePreviewClick={handlePreviewClick}
          handleViewClick={viewDocumentInNewTab}
          isPreviewButtonDisabled={downloadingPdf}
        />
      }
      icon="Document"
    >
      <DocumentInfoWrapper>
        <FilePath documentId={doc.doc.id} paths={getPathsFromDoc(doc)} />

        <Url url={doc.doc.url} />

        <MarginBottomNormalContainer>
          <Highlight doc={doc} />
        </MarginBottomNormalContainer>

        <Metadata doc={doc} />
      </DocumentInfoWrapper>

      <DocumentViewModal
        documentId={doc.doc.id}
        fileName={fileName}
        onModalClose={handleModalClose}
        modalOpen={showModal && !!doc.doc.id}
      />
    </BasePreviewCard>
  );
};

export default DocumentPreviewCard;
