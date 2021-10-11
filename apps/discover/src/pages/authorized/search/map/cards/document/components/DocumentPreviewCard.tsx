import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Icons } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';
import { useTranslation } from '@cognite/react-i18n';

import { getPathsFromDoc } from '_helpers/getPathsFromDocument';
import BasePreviewCard from 'components/card/preview-card/BasePreviewCard';
import { TitleButton } from 'components/card/preview-card/elements';
import { DocumentAssets } from 'components/document-info-panel/DocumentAssets';
import { FilePath } from 'components/document-info-panel/FilePath';
import DocumentViewModal from 'components/document-preview-card/DocumentViewModal';
import { showSuccessMessage } from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { openDocumentPreviewInNewTab } from 'modules/documentPreview/utils';
import { useDocumentResult } from 'modules/documentSearch/selectors';
import { clearSelectedDocument } from 'modules/map/actions';
import { MarginBottomNormalContainer } from 'styles/layout';

import { DocumentPreviewActions } from './DocumentPreviewActions';
import { DocumentInfoWrapper } from './elements';
import { Highlight } from './Highlight';
import { Metadata } from './Metadata';

export const DocumentPreviewCard: React.FC<{ documentId: string }> = ({
  documentId,
}) => {
  const metrics = useGlobalMetrics('map');
  const doc = useDocumentResult(documentId);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const [downloadingPdf, setDownloadingPdf] = React.useState<boolean>(false);
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

  const viewDocumentInNewTab = async () => {
    metrics.track('click-view-document-in-tab-button');

    setDownloadingPdf(true);
    showSuccessMessage(t('Retrieving document'));

    if (doc && doc.doc.id) {
      openDocumentPreviewInNewTab(doc.doc.id).catch((error) => {
        t('Oops, something went wrong');
        reportException(error);
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    metrics.track('click-close-document-preview-button');
  };

  const handlePreviewClose = () => dispatch(clearSelectedDocument());

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
      iconButton={
        <TitleButton>
          <Icons.Document />
        </TitleButton>
      }
    >
      <DocumentInfoWrapper>
        <MarginBottomNormalContainer>
          <FilePath documentId={doc.doc.id} paths={getPathsFromDoc(doc)} />
        </MarginBottomNormalContainer>

        <MarginBottomNormalContainer>
          <Highlight doc={doc} />
        </MarginBottomNormalContainer>

        <Metadata doc={doc} />

        <MarginBottomNormalContainer>
          <DocumentAssets assetIds={doc.doc.assetIds} />
        </MarginBottomNormalContainer>
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
