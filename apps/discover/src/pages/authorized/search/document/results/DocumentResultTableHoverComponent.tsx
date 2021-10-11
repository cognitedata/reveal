import { useTranslation } from 'react-i18next';

import { Menu } from '@cognite/cogs.js';
import { reportException } from '@cognite/react-errors';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import {
  MoreOptionsButton,
  PreviewButton,
  ViewButton,
} from 'components/buttons';
import { HoverDropdown } from 'components/hover-dropdown/HoverDropdown';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { openDocumentPreviewInNewTab } from 'modules/documentPreview/utils';
import { DocumentRowType } from 'modules/documentSearch/types';
import { FlexRow } from 'styles/layout';

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
      <HoverDropdown
        content={
          <Menu>
            {onExtractParentFolderHandle && (
              <Menu.Item
                data-testid="menu-item-extract-parent-folder"
                onClick={() => onExtractParentFolderHandle(row)}
              >
                Open parent folder
              </Menu.Item>
            )}
            <Menu.Item
              data-testid="menu-item-open-feedback"
              onClick={() => onOpenFeedbackHandle(row)}
            >
              Leave feedback
            </Menu.Item>
            <Menu.Submenu
              content={
                <AddToFavoriteSetMenu
                  documentIds={[Number(row.original.doc.id)]}
                />
              }
            >
              <span>Add to favorites</span>
            </Menu.Submenu>
          </Menu>
        }
      >
        <MoreOptionsButton data-testid="menu-button" />
      </HoverDropdown>
    </FlexRow>
  );
};
