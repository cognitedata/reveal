import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { Notification } from '../../../../../../../components/Notification/Notification';
import { useTranslation } from '../../../../../../../hooks/useTranslation';
import {
  RuleDto,
  useDeleteRules,
  useListAllRules,
} from '../../../../api/codegen';
import { DeleteModal } from '../../../../components/DeleteModal/DeleteModal';
import { useDisclosure, useLoadDataSource } from '../../../../hooks';
import { getDefaultRulesetId } from '../../../../utils/namingPatterns';

type RuleOptionsMenuProps = { rule: RuleDto };

export const RuleOptionsMenu = ({ rule }: RuleOptionsMenuProps) => {
  const { t } = useTranslation('RuleOptionsMenu');

  const { dataSource } = useLoadDataSource();

  const deleteRuleModal = useDisclosure({ isOpen: false });

  const rulesetId =
    rule.rulesetId || getDefaultRulesetId(dataSource?.externalId);

  const { isLoading, mutate: deleteRules } = useDeleteRules();
  const { refetch } = useListAllRules(
    {
      pathParams: {
        dataSourceId: dataSource?.externalId,
      },
    },
    { enabled: !!dataSource?.externalId }
  );

  const onSuccess = () => {
    refetch();
    Notification({
      type: 'success',
      message: t('data_quality_success_delete', ``, {
        targetName: rule.name,
        targetType: 'Rule',
      }),
    });
  };

  const onError = (error: any) => {
    Notification({
      type: 'error',
      message: t('data_quality_error_delete', '', { target: 'rule' }),
      errors: JSON.stringify(error),
    });
  };

  const handleDelete = async () => {
    try {
      await deleteRules(
        {
          pathParams: {
            dataSourceId: dataSource?.externalId,
            rulesetId,
          },
          body: { items: [{ externalId: rule.externalId }] },
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
              onClick={deleteRuleModal.onOpen}
            >
              {t('delete', 'Delete')}
            </Menu.Item>
          </Menu>
        }
        hideOnClick
      >
        <Button
          aria-label="Open options menu for the rule"
          icon="EllipsisVertical"
          size="small"
          type="ghost"
        />
      </Dropdown>

      <DeleteModal
        bodyText={t('data_quality_delete_rule', '', { targetName: rule.name })}
        checkboxText={t('data_quality_delete_confirm', '', {
          target: 'rule',
        })}
        onCancel={deleteRuleModal.onClose}
        onOk={handleDelete}
        titleText={t('data_quality_delete_title', '', {
          target: 'rule',
        })}
        visible={deleteRuleModal.isOpen}
      />
    </>
  );
};
