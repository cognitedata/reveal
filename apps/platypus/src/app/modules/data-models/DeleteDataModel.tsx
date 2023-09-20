import { useState } from 'react';

import { DataModel, StorageProviderType } from '@platypus/platypus-core';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { NoNameDisplayName } from '@platypus-app/constants';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

import {
  Body,
  Button,
  Checkbox,
  Flex,
  Icon,
  Modal,
  Tooltip,
} from '@cognite/cogs.js';

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
  const [deleteDataTypes, setDeleteDataTypes] = useState<boolean>(false);
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  const queryClient = useQueryClient();

  const onDeleteDataModel = (dataModelExternalId: string) => {
    setDeleting(true);
    dataModelsHandler
      .delete(
        { externalId: dataModelExternalId, space: dataModel.space },
        deleteDataTypes
      )
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

          const referencedViewsText =
            deleteDataTypes && hasReferencedView
              ? `\nViews: \n${referencedViews
                  .map((el) => `- ${el.externalId}`)
                  .join('\n')}
                ${t(
                  'not_deleted_text',
                  'are not deleted because they are used in other data models. For details, click: '
                )}`
              : '';

          const copyButton = (
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
          );
          Notification({
            type: 'success',
            message: `"${dataModel.name || NoNameDisplayName}" ${t(
              'success_data_model_deleted',
              `was deleted.`
            )} ${referencedViewsText}`,
            extra: deleteDataTypes && hasReferencedView ? copyButton : null,
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
          'delete_data_model_modal_body',
          'Do you want to delete the data model «{{dataModelName}}»?',
          { dataModelName: dataModel.name || NoNameDisplayName }
        )}
      </Body>
      <Flex alignItems="center" gap={4} style={{ marginTop: 8 }}>
        <Checkbox
          checked={deleteDataTypes}
          onChange={(e) => setDeleteDataTypes(e.target.checked)}
        >
          {t('delete_types_label', '')}
        </Checkbox>
        <div style={{ marginTop: 4 }}>
          <Tooltip content={t('delete_types_desc', '')} wrapped>
            <Icon type="Warning" />
          </Tooltip>
        </div>
      </Flex>
    </Modal>
  );
};
