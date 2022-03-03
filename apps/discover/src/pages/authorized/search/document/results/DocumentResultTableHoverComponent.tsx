import { useTranslation } from 'react-i18next';

import { openDocumentPreviewInNewTab } from 'services/documentPreview/utils';

import { Menu, Dropdown } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import {
  MoreOptionsButton,
  PreviewButton,
  ViewButton,
} from 'components/buttons';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { DocumentType } from 'modules/documentSearch/types';
import { FlexRow } from 'styles/layout';

import {
  ADD_TO_FAVORITES_OPTION_TEXT,
  LEAVE_FEEDBACK_OPTION_TEXT,
  OPEN_PARENT_FOLDER_OPTION_TEXT,
} from '../constants';

type SelectionHandle = (row: DocumentType) => void;

export type Props = {
  doc: DocumentType;
  onPreviewHandle: SelectionHandle;
  onExtractParentFolderHandle?: SelectionHandle;
  onOpenFeedbackHandle: SelectionHandle;
};

export const DocumentResultTableHoverComponent = ({
  doc,
  onPreviewHandle,
  onExtractParentFolderHandle,
  onOpenFeedbackHandle,
}: Props) => {
  const { t } = useTranslation();

  const onViewHandle = async (doc: DocumentType) => {
    showSuccessMessage(t('Retrieving document'));
    openDocumentPreviewInNewTab(doc.doc.id).catch((error) => {
      showErrorMessage(t('Oops, something went wrong'));
      reportException(error);
    });
  };

  // TODO(PP-2573): check if this can be removed after upgrading the pdf viewer lib
  const getPreviewButton = (doc: DocumentType) => {
    if (doc.doc.filetype === 'Compressed') {
      return null;
    }
    return (
      <PreviewButton
        data-testid="button-preview-document"
        onClick={() => onPreviewHandle(doc)}
      />
    );
  };

  return (
    <FlexRow>
      <ViewButton
        data-testid="button-view-document"
        onClick={() => onViewHandle(doc)}
      />
      {getPreviewButton(doc)}
      <Dropdown
        appendTo={document.body}
        content={
          <Menu>
            {onExtractParentFolderHandle && (
              <Menu.Item
                data-testid="menu-item-extract-parent-folder"
                onClick={() => onExtractParentFolderHandle(doc)}
              >
                {OPEN_PARENT_FOLDER_OPTION_TEXT}
              </Menu.Item>
            )}
            <Menu.Item
              data-testid="menu-item-open-feedback"
              onClick={() => onOpenFeedbackHandle(doc)}
            >
              {LEAVE_FEEDBACK_OPTION_TEXT}
            </Menu.Item>
            <Menu.Submenu
              content={
                <AddToFavoriteSetMenu documentIds={[Number(doc.doc.id)]} />
              }
            >
              <span>{ADD_TO_FAVORITES_OPTION_TEXT}</span>
            </Menu.Submenu>
          </Menu>
        }
      >
        <MoreOptionsButton data-testid="menu-button" />
      </Dropdown>
    </FlexRow>
  );
};
