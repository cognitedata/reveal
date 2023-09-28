import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

type ShowUpsertSuccessProps = {
  isUpdate: boolean;
  onSuccess: VoidFunction;
  targetName: string;
  targetType: string;
};

/** Show a notification when upsert is successful for any target part of the data quality entities.
 * A target can be a rule, a data scope or a ruleset. */
export const useShowUpsertSuccess = () => {
  const { t } = useTranslation('useUpsertSuccess');

  const showUpsertSuccess = ({
    isUpdate,
    onSuccess,
    targetName,
    targetType,
  }: ShowUpsertSuccessProps) => {
    const message = isUpdate
      ? t('data_quality_success_update', ``, { targetName, targetType })
      : t('data_quality_success_create', ``, { targetName, targetType });

    Notification({
      type: 'success',
      message,
    });

    onSuccess();
  };

  return { showUpsertSuccess };
};
