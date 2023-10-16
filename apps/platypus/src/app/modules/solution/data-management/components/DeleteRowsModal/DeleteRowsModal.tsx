import { useState } from 'react';

import { Checkbox, Modal } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

export const DeleteRowsModal = ({
  selectedRowsExternalIds,
  isVisible,
  isDeleting,
  onCancel,
  onDelete,
}: {
  selectedRowsExternalIds?: string[];
  isVisible: boolean;
  isDeleting: boolean;
  onCancel: VoidFunction;
  onDelete: VoidFunction;
}) => {
  const { t } = useTranslation('previewDataRowsDeleteDialog');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  console.log('selectedRowsExternalIds', selectedRowsExternalIds);

  const descriptionText =
    selectedRowsExternalIds?.length === 1 ? (
      <>
        <p>
          {t(
            'are_you_sure_to_delete_data_row_1',
            'Are you sure you want to delete '
          )}
          <strong>{selectedRowsExternalIds[0]}</strong>
          {t('are_you_sure_to_delete_data_row_2', '?')}
        </p>
        <p>
          {t(
            'are_you_sure_to_delete_data_row_3',
            'Contents of this instance will be deleted.'
          )}
        </p>
      </>
    ) : (
      <>
        <p>
          {t(
            'are_you_sure_to_delete_selected_rows_row_1',
            'Are you sure you want to delete these instances?'
          )}
        </p>
        <p>
          {t(
            'are_you_sure_to_delete_selected_rows_row_2',
            'Contents of the selected instances will be permanently deleted.'
          )}
        </p>
      </>
    );
  const confirmationText =
    selectedRowsExternalIds?.length === 1 ? (
      <>
        {t('yes_sure_to_delete_data_row', "Yes, I'm sure I want to delete ")}
        <strong>{selectedRowsExternalIds[0]}</strong>
      </>
    ) : (
      <>
        {t(
          'yes_sure_to_delete_multiple_rows',
          "Yes, I'm sure I want to delete the selected instances"
        )}
      </>
    );

  return (
    <Modal
      visible={isVisible}
      title={t('delete_data_rows', 'Delete?')}
      onCancel={() => {
        setConfirmDelete(false);
        onCancel();
      }}
      onOk={onDelete}
      okDisabled={!confirmDelete || isDeleting}
      okText={t('delete', 'Delete')}
      icon={isDeleting ? 'Loader' : undefined}
      destructive
    >
      <div>
        {descriptionText}
        <br />
        <div className="confirmDelete">
          <Checkbox
            name="ConfirmDelete"
            checked={confirmDelete}
            onChange={() => setConfirmDelete(!confirmDelete)}
            data-cy="data-row-confirm-deletion-checkbox"
          >
            <span className="confirmDeleteText">{confirmationText}</span>
          </Checkbox>
        </div>
      </div>
    </Modal>
  );
};
