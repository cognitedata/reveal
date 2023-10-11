import { useTranslation } from '../../../../../hooks/useTranslation';
import { DataSourceDto, RuleDto } from '../../api/codegen';
import { AccessAction, useAccessControl } from '../useAccessControl';

import { ValidationStatus } from './types';

/** Checks if validation trigger should be disabled and returns an appropriate message. */
export const useDisableValidation = (
  rules: RuleDto[],
  dataSource?: DataSourceDto
) => {
  const { t } = useTranslation('useDisableValidation');
  const {
    canTriggerValidation,
    useErrorMessage,
    isLoading: loadingAccess,
  } = useAccessControl();

  const accessErrorMessage = useErrorMessage(AccessAction.TRIGGER_VALIDATION);
  let disabledMessage = '';

  const isDisabled =
    !dataSource || loadingAccess || !canTriggerValidation || rules.length === 0;

  if (!dataSource)
    disabledMessage = t('data_quality_validation_disabled_ds', '');
  if (rules.length === 0)
    disabledMessage = t('data_quality_validation_disabled_rules', '');
  if (!canTriggerValidation) disabledMessage = accessErrorMessage;

  return { disabledMessage, isDisabled };
};

/** Returns an appropriate label and message for a given validation status. */
export const useValidationStatusMessage = (status: ValidationStatus) => {
  const { t } = useTranslation('useValidationStatusMessage');

  const statusMessages: Record<
    ValidationStatus,
    { label: string; message: string }
  > = {
    Error: {
      label: t('data_quality_validation_status_label_error', ''),
      message: t('data_quality_validation_status_message_error', ''),
    },
    Idle: {
      label: '',
      message: '',
    },
    InProgress: {
      label: t('data_quality_validation_status_label_in_progress', ''),
      message: t('data_quality_validation_status_message_in_progress', ''),
    },
    Success: {
      label: t('data_quality_validation_status_label_success', ''),
      message: t('data_quality_validation_status_message_success', ''),
    },
  };

  return statusMessages[status];
};
