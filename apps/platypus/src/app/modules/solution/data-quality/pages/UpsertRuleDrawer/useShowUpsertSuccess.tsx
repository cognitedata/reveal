import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

type ShowUpsertSuccessProps = {
  isUpdate: boolean;
  onSuccess: VoidFunction;
  ruleName: string;
};

/** Show a notification when upsert is successful for a rule. */
export const useShowUpsertSuccess = () => {
  const { t } = useTranslation('useUpsertSuccess');

  const showUpsertSuccess = ({
    isUpdate,
    onSuccess,
    ruleName,
  }: ShowUpsertSuccessProps) => {
    const message = isUpdate
      ? t(
          'data_quality_rule_updated',
          `Rule "${ruleName}" was updated successfully!`,
          { ruleName: ruleName }
        )
      : t(
          'data_quality_rule_created',
          `Rule "${ruleName}" was created successfully!`,
          { ruleName: ruleName }
        );

    Notification({
      type: 'success',
      message,
    });

    onSuccess();
  };

  return { showUpsertSuccess };
};
