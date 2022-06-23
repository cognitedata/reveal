import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { CloseButton } from 'components/Buttons';
import TableBulkActions from 'components/TableBulkActions';
import { useTranslation } from 'hooks/useTranslation';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';
import { deselectAllFiles } from 'modules/seismicSearch/utils';

import { VIEW_IN } from '../constants';
import SeismicSectionView from '../seismic-section-view/SeismicSectionView';

import { ThreeDeePreview } from './ThreeDeePreview';

type ViewInOption = '3d' | 'section' | undefined;

export const ViewInSelector = () => {
  const dispatch = useDispatch();
  const [openedModal, setOpenedModal] = useState<ViewInOption>(undefined);

  const selectedFiles = useSelectedFiles();

  const { t } = useTranslation();

  const handleChange = (viewInOption: ViewInOption) => {
    if (!selectedFiles.length) {
      return;
    }

    setOpenedModal(viewInOption);
  };

  const handleModalClose = () => {
    setOpenedModal(undefined);
  };

  const deselectAll = () => {
    dispatch(deselectAllFiles());
  };

  return (
    <TableBulkActions
      isVisible={!!selectedFiles.length}
      title={`${selectedFiles.length} selected`}
    >
      <Dropdown
        placement="top"
        content={
          <Menu>
            <Menu.Item onClick={() => handleChange('section')}>
              Section View
            </Menu.Item>
            <Menu.Item onClick={() => handleChange('3d')}>3D View</Menu.Item>
          </Menu>
        }
      >
        <Button
          variant="default"
          icon="ChevronUp"
          iconPlacement="right"
          data-testid="seismic-view-in-button"
          aria-label="View button"
        >
          {t(VIEW_IN)}
        </Button>
      </Dropdown>
      {openedModal === '3d' && <ThreeDeePreview onClose={handleModalClose} />}
      {openedModal === 'section' && (
        <SeismicSectionView onClose={handleModalClose} />
      )}

      <TableBulkActions.Separator />

      <CloseButton
        variant="inverted"
        tooltip="Clear selection"
        onClick={deselectAll}
        data-testid="document-favorite-all-button"
        aria-label="Clear selection"
      />
    </TableBulkActions>
  );
};
