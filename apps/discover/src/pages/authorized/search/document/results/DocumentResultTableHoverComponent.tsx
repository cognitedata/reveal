import { useTranslation } from 'react-i18next';

import { Menu, Dropdown } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import {
  MoreOptionsButton,
  PreviewButton,
  ViewButton,
} from 'components/buttons';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { openDocumentPreviewInNewTab } from 'modules/documentPreview/utils';
import { DocumentRowType } from 'modules/documentSearch/types';
import { FlexRow } from 'styles/layout';

import {
  ADD_TO_FAVORITES_OPTION_TEXT,
  LEAVE_FEEDBACK_OPTION_TEXT,
  OPEN_PARENT_FOLDER_OPTION_TEXT,
} from '../constants';

type SelectionHandle = (row: DocumentRowType) => void;

export type Props = {
  row: DocumentRowType;
  onPreviewHandle: SelectionHandle;
  onExtractParentFolderHandle?: SelectionHandle;
  onOpenFeedbackHandle: SelectionHandle;
};

export const DocumentResultTableHoverComponent = ({
  row,
  onPreviewHandle,
  onExtractParentFolderHandle,
  onOpenFeedbackHandle,
}: Props) => {
  const { t } = useTranslation();

  const onViewHandle = async (row: DocumentRowType) => {
    showSuccessMessage(t('Retrieving document'));
    openDocumentPreviewInNewTab(row.original.doc.id).catch((error) => {
      showErrorMessage(t('Oops, something went wrong'));
      reportException(error);
    });
  };

  return (
    <FlexRow>
      <ViewButton
        data-testid="button-view-document"
        onClick={() => onViewHandle(row)}
      />
      <PreviewButton
        data-testid="button-preview-document"
        onClick={() => onPreviewHandle(row)}
      />
      <Dropdown
        openOnHover
        appendTo={document.body}
        content={
          <Menu>
            {onExtractParentFolderHandle && (
              <Menu.Item
                data-testid="menu-item-extract-parent-folder"
                onClick={() => onExtractParentFolderHandle(row)}
              >
                {OPEN_PARENT_FOLDER_OPTION_TEXT}
              </Menu.Item>
            )}
            <Menu.Item
              data-testid="menu-item-open-feedback"
              onClick={() => onOpenFeedbackHandle(row)}
            >
              {LEAVE_FEEDBACK_OPTION_TEXT}
            </Menu.Item>
            <Menu.Submenu
              content={
                <AddToFavoriteSetMenu
                  documentIds={[Number(row.original.doc.id)]}
                />
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
