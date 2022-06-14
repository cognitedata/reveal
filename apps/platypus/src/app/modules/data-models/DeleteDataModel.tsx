import { useState } from 'react';
import { Checkbox } from '@cognite/cogs.js';

import { DataModel, StorageProviderType } from '@platypus/platypus-core';

import { Notification } from '@platypus-app/components/Notification/Notification';

import { useTranslation } from '../../hooks/useTranslation';
import { TOKENS } from '@platypus-app/di';
import { StyledModalDialog } from './elements';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { useInjection } from '@platypus-app/hooks/useInjection';

export const DeleteDataModel = ({
  dataModel,
  onCancel,
  onAfterDeleting,
}: {
  dataModel: DataModel;
  onCancel: VoidFunction;
  onAfterDeleting: VoidFunction;
}) => {
  const { t } = useTranslation('dataModelsDeleteDialog');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);

  const onDeleteDataModel = (dataModelExternalId: string) => {
    dataModelsHandler.delete({ id: dataModelExternalId }).then((result) => {
      setDeleting(true);
      if (result.error) {
        Notification({
          type: 'error',
          message: result.error.name,
        });
      } else {
        Notification({
          type: 'info',
          message: t(
            'success_data_model_deleted',
            `Data Model «${dataModel.name}» was deleted.`
          ),
        });

        localStorageProvider.removeItem(getLocalDraftKey(dataModel.id));
        onCancel();
        onAfterDeleting();
      }
    });
  };

  return (
    <StyledModalDialog
      visible={dataModel ? true : false}
      title={t('delete_solution', 'Delete Data Model')}
      onCancel={() => {
        onCancel();
        setConfirmDelete(false);
      }}
      onOk={() => onDeleteDataModel(dataModel.id)}
      okDisabled={!confirmDelete}
      okButtonName={t('delete', 'Delete')}
      okProgress={deleting}
      okType="danger"
    >
      <div>
        {t(
          'are_you_sure_to_delete_data_model_1',
          'Are you sure you want to delete «'
        )}
        <strong>{dataModel.name}</strong>
        {t(
          'are_you_sure_to_delete_data_model_2',
          '»? You will lose all of the data, and will not be able to restore it later.'
        )}
        <div className="confirmDelete">
          <Checkbox
            name="ConfirmDelete"
            checked={confirmDelete}
            onChange={() => setConfirmDelete(!confirmDelete)}
          />{' '}
          <span
            onClick={() => setConfirmDelete(!confirmDelete)}
            className="confirmDeleteText"
          >
            {t(
              'yes_sure_to_delete_data_model',
              'Yes, I’m sure I want to delete this data model.'
            )}
          </span>
        </div>
      </div>
    </StyledModalDialog>
  );
};
