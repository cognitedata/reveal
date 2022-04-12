import { useTranslation } from 'react-i18next';

import { openDocumentPreviewInNewTab } from 'services/documentPreview/utils';
import { handleServiceError } from 'utils/errors';

import { Menu, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import {
  MoreOptionsButton,
  PreviewButton,
  ViewButton,
} from 'components/buttons';
import { showSuccessMessage } from 'components/toast';
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
    openDocumentPreviewInNewTab(doc.doc.id).catch(handleServiceError);
  };

  // TODO(PP-2573): check if this can be removed after upgrading the pdf viewer lib
  const getPreviewButton = (doc: DocumentType) => {
    if (doc.doc.fileCategory === 'Compressed') {
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
        openOnHover
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
