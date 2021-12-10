import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Menu, Dropdown } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';

import {
  PreviewButton,
  ViewButton,
  MoreOptionsButton,
} from 'components/buttons';
import DocumentViewModal from 'components/document-preview-card/DocumentViewModal';
import {
  showInfoMessageWithTitle,
  showErrorMessage,
  showSuccessMessage,
} from 'components/toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  downloadFileFromUrl,
  openDocumentPreviewInNewTab,
} from 'modules/documentPreview/utils';
import { FavoriteDocumentData, FavouriteRowType } from 'modules/favorite/types';
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
  row: FavouriteRowType<FavoriteDocumentData>;
  removeDocument: (item: FavoriteDocumentData) => void;
}
export const Actions: React.FC<Props> = ({
  showRemoveOption,
  row,
  removeDocument,
}) => {
  const dispatch = useDispatch();
  const [isWarningOpen, setWarningOpen] = useState(false);
  const { t } = useTranslation();
  // const { data: config } = useDocumentConfig();

  const metrics = useGlobalMetrics('favorites');

  const [documentToPreview, setDocumentToPreview] = useState<
    FavoriteDocumentData | undefined
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

  const handlePreviewClick = async (document: FavoriteDocumentData) => {
    setDocumentToPreview(document);
    metrics.track('click-open-document-preview-button');
  };

  const handlePreviewDocument = async (documentId: string) => {
    showSuccessMessage(t('Retrieving document'));

    if (documentId) {
      openDocumentPreviewInNewTab(documentId).catch((error) => {
        showErrorMessage(t('Oops, something went wrong'));
        reportException(error);
      });
    }
  };

  const onOpenFeedback = (documentId: string) => {
    dispatch(setObjectFeedbackModalDocumentId(documentId));
    metrics.track('click-provide-document-feedback-button');
  };

  // const onExtractParentFolder = (document: FavoriteDocumentData) => {
  //   const parentPath = document.path;
  //   if (!parentPath) {
  //     showErrorMessage('Parent path not found');
  //     return;
  //   }
  //   dispatch(
  //     documentSearchActions.extractParentFolder(parentPath, config?.extractByFilepath)
  //   );
  // };

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
              {/* temporarily removing this option until the design is finalized */}
              {/* <Menu.Divider />
                <Menu.Item
                  onClick={() => onExtractParentFolder(row.row.original)}
                >
                  Open parent folder
                </Menu.Item> */}
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

  const title = row.row.original?.name || '';

  return (
    <>
      {renderRowHoverComponent()}

      <DocumentViewModal
        documentId={documentToPreview?.id?.toString() || ''}
        fileName={documentToPreview?.name}
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
