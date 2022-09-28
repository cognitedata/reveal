import { useState } from 'react';
import { Checkbox } from '@cognite/cogs.js';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { StyledModalDialog } from './elements';

export const DeleteRowsModal = ({
  isVisible,
  isDeleting,
  onCancel,
  onDelete,
  singleRowExternalId,
}: {
  isVisible: boolean;
  isDeleting: boolean;
  onCancel: VoidFunction;
  onDelete: VoidFunction;
  singleRowExternalId?: string | undefined;
}) => {
  const { t } = useTranslation('previewDataRowsDeleteDialog');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const descriptionText = singleRowExternalId ? (
    <>
      {t(
        'are_you_sure_to_delete_data_row_1',
        'Are you sure you want to delete '
      )}
      <strong>{singleRowExternalId}</strong>
      {t('are_you_sure_to_delete_data_row_2', '?')}
      <br />
      {t(
        'are_you_sure_to_delete_data_row_3',
        'Contents of this instance will be deleted.'
      )}
    </>
  ) : (
    <>
      {t(
        'are_you_sure_to_delete_data_row_1',
        'Are you sure you want to delete these instances?'
      )}
      <br />
      {t(
        'are_you_sure_to_delete_data_row_2',
        'Contents of these instances will be deleted.'
      )}
    </>
  );
  const confirmationText = singleRowExternalId ? (
    <>
      {t('yes_sure_to_delete_data_row', "Yes, I'm sure I want to delete ")}
      <strong>{singleRowExternalId}</strong>
    </>
  ) : (
    <>
      {t(
        'yes_sure_to_delete_data_row',
        "Yes, I'm sure I want to delete these instances"
      )}
    </>
  );

  return (
    <StyledModalDialog
      visible={isVisible}
      title={t('delete_data_rows', 'Delete?')}
      onCancel={() => {
        setConfirmDelete(false);
        onCancel();
      }}
      onOk={onDelete}
      okDisabled={!confirmDelete}
      okButtonName={t('delete', 'Delete')}
      okProgress={isDeleting}
      okType="danger"
    >
      <div>
        {descriptionText}
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
    </StyledModalDialog>
  );
};
