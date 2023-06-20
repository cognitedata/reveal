import { useDataSourceValidation } from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

/** Start a validation job on the current data source and its rules. */
export const useStartValidation = (): {
  isLoading: boolean;
  startValidation: () => void;
} => {
  const { t } = useTranslation('useStartValidation');

  const { dataSource } = useLoadDataSource();

  const { isLoading, mutate: validateDataSource } = useDataSourceValidation();

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
      message: JSON.stringify(error?.stack?.error),
    });
  };

  const startValidation = async () => {
    await validateDataSource(
      {
        pathParams: {
          dataSourceId: dataSource?.externalId,
        },
      },
      { onSuccess: onSuccess, onError: onError }
    );
  };

  return { isLoading, startValidation };
};
