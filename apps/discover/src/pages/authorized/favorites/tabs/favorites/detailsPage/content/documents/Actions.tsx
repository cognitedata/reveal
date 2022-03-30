import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
  downloadFileFromUrl,
  openDocumentPreviewInNewTab,
} from 'services/documentPreview/utils';
import { handleServiceError } from 'utils/service/handleServiceError';

import { Menu, Dropdown } from '@cognite/cogs.js';

import {
  PreviewButton,
  ViewButton,
  MoreOptionsButton,
} from 'components/buttons';
import DocumentViewModal from 'components/document-preview/DocumentViewModal';
import { showInfoMessageWithTitle, showSuccessMessage } from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { DocumentType } from 'modules/documentSearch/types';
import { FavouriteRowType } from 'modules/favorite/types';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { DeleteDocumentFromSetModal } from 'pages/authorized/favorites/modals';
import {
  DOWNLOAD_MESSAGE,
  DOWNLOADING,
} from 'pages/authorized/search/constants';
import { MenuItemDanger } from 'pages/authorized/search/elements';
import { FlexRow } from 'styles/layout';

interface Props {
  showRemoveOption: boolean;
  row: FavouriteRowType<DocumentType>;
  removeDocument: (item: DocumentType) => void;
}
export const Actions: React.FC<Props> = ({
  showRemoveOption,
  row,
  removeDocument,
}) => {
  const dispatch = useDispatch();
  const [isWarningOpen, setWarningOpen] = useState(false);
  const { t } = useTranslation();

  const metrics = useGlobalMetrics('favorites');

  const [documentToPreview, setDocumentToPreview] = useState<
    DocumentType | undefined
  >(undefined);

  const downloadDocument = () => {
    metrics.track('click-download-single-document-button');

    showInfoMessageWithTitle(t(DOWNLOADING), t(DOWNLOAD_MESSAGE));
    downloadFileFromUrl(row.row.original.id?.toString());
  };

  const handleOpenWarning = () => {
    setWarningOpen(true);
  };

  const handleCloseWarning = () => {
    setWarningOpen(false);
  };

  const handleRemoveDocument = () => {
    metrics.track('click-open-remove-document-from-set-modal-button');

    removeDocument(row.row.original);
    setWarningOpen(false);
  };

  const handleModalClose = () => {
    setDocumentToPreview(undefined);
    metrics.track('click-close-document-preview-button');
  };

  const handlePreviewClick = async (document: DocumentType) => {
    setDocumentToPreview(document);
    metrics.track('click-open-document-preview-button');
  };

  const handlePreviewDocument = async (documentId: string) => {
    showSuccessMessage(t('Retrieving document'));

    if (documentId) {
      openDocumentPreviewInNewTab(documentId).catch(handleServiceError);
    }
  };

  const onOpenFeedback = (documentId: string) => {
    dispatch(setObjectFeedbackModalDocumentId(documentId));
    metrics.track('click-provide-document-feedback-button');
  };

  const renderRowHoverComponent = () => {
    return (
      <FlexRow>
        <PreviewButton
          data-testid="button-preview-document"
          onClick={() => handlePreviewClick(row.row.original)}
        />
        <ViewButton
          data-testid="button-preview-document"
          onClick={() => handlePreviewDocument(row.row.original.id?.toString())}
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Item onClick={downloadDocument}>Download</Menu.Item>
              <Menu.Item
                onClick={() => onOpenFeedback(row.row.original.id?.toString())}
              >
                Leave feedback
              </Menu.Item>

              {showRemoveOption && (
                <>
                  <Menu.Divider />
                  <MenuItemDanger onClick={handleOpenWarning}>
                    Remove
                  </MenuItemDanger>
                </>
              )}
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
      </FlexRow>
    );
  };

  if (!row) {
    return null;
  }

  const title = row.row.original?.filename || '';

  return (
    <>
      {renderRowHoverComponent()}

      <DocumentViewModal
        documentId={documentToPreview?.id?.toString() || ''}
        fileName={documentToPreview?.filename}
        onModalClose={handleModalClose}
        modalOpen={!!documentToPreview}
      />

      <DeleteDocumentFromSetModal
        title={title}
        onConfirm={handleRemoveDocument}
        onClose={handleCloseWarning}
        isOpen={isWarningOpen}
      />
    </>
  );
};
