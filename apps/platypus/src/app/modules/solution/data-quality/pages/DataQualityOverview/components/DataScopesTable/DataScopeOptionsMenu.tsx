import { DataScopeDto, useDeleteDataScopes } from '@data-quality/api/codegen';
import { DeleteModal } from '@data-quality/components';
import {
  useDisclosure,
  useLoadDataScopes,
  useLoadDataSource,
} from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

type DataScopeOptionsMenuProps = { dataScope: DataScopeDto };

export const DataScopeOptionsMenu = ({
  dataScope,
}: DataScopeOptionsMenuProps) => {
  const { t } = useTranslation('RuleOptionsMenu');

  const { dataSource } = useLoadDataSource();
  const { isLoading, mutate: deleteDataScopes } = useDeleteDataScopes();
  const { refetch } = useLoadDataScopes();

  const deleteDataScopeModal = useDisclosure({ isOpen: false });

  const onSuccess = () => {
    refetch();
    Notification({
      type: 'success',
      message: t('data_quality_success_delete', ``, {
        targetName: dataScope.name,
        targetType: 'Data scope',
      }),
    });
  };

  const onError = (error: any) => {
    Notification({
      type: 'error',
      message: t('data_quality_error_delete', '', { target: 'data scope' }),
      errors: JSON.stringify(error),
    });
  };

  const handleDelete = async () => {
    if (!dataSource) {
      onError('No data source found');
      return;
    }

    try {
      await deleteDataScopes(
        {
          pathParams: { dataSourceId: dataSource.externalId },
          body: { items: [{ externalId: dataScope.externalId }] },
        },
        { onSuccess: onSuccess, onError: onError }
      );
    } catch (err) {
      onError(err);
    }
  };

  return (
    <>
      <Dropdown
        content={
          <Menu loading={isLoading}>
            <Menu.Item
              destructive
              icon="Delete"
              onClick={deleteDataScopeModal.onOpen}
            >
              {t('delete', 'Delete')}
            </Menu.Item>
          </Menu>
        }
        hideOnClick
      >
        <Button
          aria-label="Open options menu for the data scope"
          icon="EllipsisVertical"
          size="small"
          type="ghost"
        />
      </Dropdown>

      <DeleteModal
        bodyText={t('data_quality_delete_data_scope', '', {
          targetName: dataScope.name,
        })}
        checkboxText={t('data_quality_delete_confirm', '', {
          target: 'data scope',
        })}
        onCancel={deleteDataScopeModal.onClose}
        onOk={handleDelete}
        titleText={t('data_quality_delete_title', '', {
          target: 'data scope',
        })}
        visible={deleteDataScopeModal.isOpen}
      />
    </>
  );
};
