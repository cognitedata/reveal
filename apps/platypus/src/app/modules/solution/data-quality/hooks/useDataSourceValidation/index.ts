import { useState } from 'react';

import { useDataSourceValidationRun } from '@data-quality/api/codegen';
import { useLoadDataSource, useLoadRules } from '@data-quality/hooks';
import { sleep } from '@data-quality/utils/async';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { useLoadLatestRuleRuns } from '../useLoadLatestRuleRuns';

import { createSession, getValidationStatus } from './helpers';
import { useDisableValidation } from './hooks';

export * from './hooks';
export * from './types';

export function useDataSourceValidation() {
  const { t } = useTranslation('useDataSourceValidation');
  // Triggering time = create session + run validation + reload rule runs time offset
  const [isTriggeringValidation, setIsTriggeringValidation] = useState(false);

  const { dataSource } = useLoadDataSource();
  const { rules } = useLoadRules();
  const {
    ruleRuns,
    isLoading: isLoadingRuleRuns,
    refetch: refetchRuleRuns,
  } = useLoadLatestRuleRuns();

  const { mutate: validateDataSource } = useDataSourceValidationRun();

  const status = getValidationStatus(
    ruleRuns,
    isLoadingRuleRuns,
    isTriggeringValidation
  );

  const { disabledMessage, isDisabled } = useDisableValidation(
    rules,
    dataSource
  );

  const onStartError = (error: any) => {
    setIsTriggeringValidation(false);

    Notification({
      type: 'error',
      title: t('data_quality_validation_start_title_error', ''),
      message: JSON.stringify(error?.stack?.error ?? error?.message),
    });
  };

  /**
   * When validation is triggered, we need to wait a moment before refetching rule runs
   * to make sure the worker has enough time to create them
   */
  const onStartSuccess = async () => {
    Notification({
      type: 'success',
      title: t('data_quality_validation_start_title_success', ''),
      message: t('data_quality_validation_start_message_success', ''),
    });

    await sleep(2000);

    refetchRuleRuns();
    setIsTriggeringValidation(false);
  };

  const startValidation = async () => {
    setIsTriggeringValidation(true);

    try {
      const session = await createSession();

      if (!session) throw Error(t('data_quality_session_create_error', ''));

      await validateDataSource(
        {
          pathParams: {
            dataSourceId: dataSource?.externalId,
          },
          body: {
            nonce: session.nonce,
          },
        },
        { onSuccess: onStartSuccess, onError: onStartError }
      );
    } catch (err) {
      onStartError(err);
    }
  };

  return {
    disabledMessage,
    isDisabled,
    startValidation,
    status,
  };
}
