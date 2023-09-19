import {
  RuleDto,
  useDeleteRules,
  useListAllRules,
} from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';
import { getDefaultRulesetId } from '@data-quality/utils/namingPatterns';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

type RuleOptionsMenuProps = { rule: RuleDto };

export const RuleOptionsMenu = ({ rule }: RuleOptionsMenuProps) => {
  const { t } = useTranslation('RuleOptionsMenu');

  const { dataSource } = useLoadDataSource();

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
      message: t(
        'data_quality_success_delete_rule',
        `Rule "${rule.name}" was deleted successfully.`,
        rule.name
      ),
    });
  };

  const onError = (error: any) => {
    Notification({
      type: 'error',
      message: t(
        'data_quality_error_delete_rule',
        'Something went wrong. The rule could not be deleted'
      ),
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
    <Dropdown
      content={
        <Menu loading={isLoading}>
          <Menu.Item destructive icon="Delete" onClick={handleDelete}>
            {t('delete', 'Delete')}
          </Menu.Item>
        </Menu>
      }
      hideOnClick
    >
      <Button
        aria-label="Open options menu for rule"
        icon="EllipsisVertical"
        size="small"
        type="ghost"
      />
    </Dropdown>
  );
};
