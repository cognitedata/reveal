import { useState } from 'react';
import { Body, Button, Modal } from '@cognite/cogs.js';

import { DataModel, StorageProviderType } from '@platypus/platypus-core';

import { Notification } from '@platypus-app/components/Notification/Notification';

import { TOKENS } from '@platypus-app/di';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { NoNameDisplayName } from '@platypus-app/constants';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useTranslation } from '../../hooks/useTranslation';

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

  const { track } = useMixpanel();

  const [deleting, setDeleting] = useState<boolean>(false);
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  const queryClient = useQueryClient();

  const onDeleteDataModel = (dataModelExternalId: string) => {
    setDeleting(true);
    dataModelsHandler
      .delete({ externalId: dataModelExternalId, space: dataModel.space })
      .then((result) => {
        track('DataModel.Delete', {
          deletedViews: result.getValue().referencedViews?.length,
        });
        if (result.error) {
          Notification({
            type: 'error',
            message: result.error.name,
          });
        } else {
          const { referencedViews } = result.getValue();

          const hasReferencedView =
            referencedViews && referencedViews.length > 0;

          const referencedViewsText = hasReferencedView
            ? `\nViews: \n${referencedViews
                .map((el) => `- ${el.externalId}`)
                .join('\n')}
                ${t(
                  'not_deleted_text',
                  'are not deleted because they are used in other data models. For details, click: '
                )}`
            : '';
          Notification({
            type: 'success',
            message: `"${dataModel.name || NoNameDisplayName}" ${t(
              'success_data_model_deleted',
              `was deleted.`
            )} ${referencedViewsText}`,
            extra: hasReferencedView ? (
              <Button
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      {
                        message:
                          'Successfully deleted, but some data types were kept because they are still used by other data models.',
                        referencedViews,
                      },
                      null,
                      2
                    )
                  );
                }}
              >
                {t('copy', 'Copy Details')}
              </Button>
            ) : null,
          });

          localStorageProvider.removeItem(
            getLocalDraftKey(dataModel.id, dataModel.space)
          );
          queryClient.removeQueries(
            QueryKeys.DATA_MODEL(dataModel.space, dataModel.id)
          );
          queryClient.removeQueries(
            QueryKeys.DATA_MODEL_VERSION_LIST(dataModel.space, dataModel.id)
          );
          onCancel();
          onAfterDeleting();
        }
      });
  };

  return (
    <Modal
      visible={dataModel ? true : false}
      title={t('delete_data_model_modal_title', 'Delete Data Model?')}
      onCancel={() => {
        onCancel();
      }}
      onOk={() => onDeleteDataModel(dataModel.id)}
      okDisabled={deleting}
      okText={t('delete', 'Delete')}
      icon={deleting ? 'Loader' : undefined}
      destructive
    >
      <Body level={2}>
        {t(
          'delete_data_model_modal_body_1',
          'Do you want to delete the data model «'
        )}
        <strong>{dataModel.name || NoNameDisplayName}</strong>
        {t(
          'delete_data_model_modal_body_2',
          '»? The data model and all underlying data types will be permanently deleted. This may take a few minutes.'
        )}
      </Body>
    </Modal>
  );
};
