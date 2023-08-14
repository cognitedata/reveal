import {
  DataSourceDto,
  RuleDto,
  useDataSourceValidation,
} from '@data-quality/api/codegen';
import {
  AccessAction,
  useAccessControl,
  useLoadDataSource,
  useLoadRules,
} from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';

/** Start a validation job on the current data source and its rules. */
export const useStartValidation = (): {
  isDisabled: boolean;
  isLoading: boolean;
  disabledMessage: string;
  startValidation: () => void;
} => {
  const { t } = useTranslation('useStartValidation');

  const {
    canTriggerValidation,
    useErrorMessage,
    isLoading: loadingAccess,
  } = useAccessControl();

  const { dataSource } = useLoadDataSource();
  const { rules } = useLoadRules();

  const { isLoading: loadingValidation, mutate: validateDataSource } =
    useDataSourceValidation();

  const onSuccess = () => {
    Notification({
      type: 'success',
      title: t(
        'data_quality_validation_start_success',
        'Validation job started.'
      ),
      message: t(
        'data_quality_validation_start_message',
        `The process might take a couple of \n minutes to complete.
        The results will appear when the \n validation has finished.`
      ),
    });
  };

  const onError = (error: any) => {
    Notification({
      type: 'error',
      title: t(
        'data_quality_validation_start_error',
        'Validation job could not start.'
      ),
      message: JSON.stringify(error?.stack?.error ?? error?.message),
    });
  };

  const startValidation = async () => {
    try {
      const session = await createSession();

      if (!session) {
        throw Error(
          t(
            'data_quality_error_session',
            'Something went wrong. Could not establish a session.'
          )
        );
      }

      await validateDataSource(
        {
          pathParams: {
            dataSourceId: dataSource?.externalId,
          },
          body: {
            nonce: session.nonce,
          },
        },
        { onSuccess: onSuccess, onError: onError }
      );
    } catch (err) {
      onError(err);
    }
  };

  const accessErrorMessage = useErrorMessage(AccessAction.TRIGGER_VALIDATION);

  const isDisabled = rules.length === 0 || !dataSource || !canTriggerValidation;
  const disabledMessage = useDisabledMessage(
    rules,
    canTriggerValidation,
    accessErrorMessage,
    dataSource
  );

  const isLoading = loadingValidation || loadingAccess;

  return { isDisabled, isLoading, disabledMessage, startValidation };
};

const useDisabledMessage = (
  rules: RuleDto[],
  canTriggerValidation: boolean,
  accessErrorMessage: string,
  dataSource?: DataSourceDto
) => {
  const { t } = useTranslation('useDisabledMessage');

  let disabledMessage = t(
    'data_quality_validation_disabled',
    'Cannot start validation'
  );

  if (!dataSource)
    disabledMessage = t(
      'data_quality_validation_disabled_ds',
      'Can not run validation without a datasource'
    );
  if (rules.length === 0)
    disabledMessage = t(
      'data_quality_validation_disabled_rules',
      'Can not run validation without rules'
    );
  if (!canTriggerValidation) disabledMessage = accessErrorMessage;

  return disabledMessage;
};

const createSession = () =>
  sdk
    .post(`/api/v1/projects/${getProject()}/sessions`, {
      data: {
        items: [{ tokenExchange: true }],
      },
    })
    .then((res) => res.data.items[0]);
