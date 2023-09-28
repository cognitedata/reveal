import { DataSourceDto, RuleDto } from '@data-quality/api/codegen';
import {
  ValidationStatus,
  useLoadDataSource,
  useLoadDatapoints,
  useLoadRules,
} from '@data-quality/hooks';
import { emptyDatapoints } from '@data-quality/utils/validationTimeseries';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Datapoints } from '@cognite/sdk/dist/src';

/** Get the availability status of the report before the download process can start.
 * A report state can be:
 *
 * *Disabled*
 * - if there is no validity score for a data source,
 * - if there is no data source
 * - if there are no rules
 *
 * *Loading*
 * - if the data source and rules are loading
 * - if the data source validity score is loading
 *
 * If the state is disabled, an informative message will be displayed.
 */
export const useReportAvailability = (validationStatus: ValidationStatus) => {
  const { dataSource, isLoading: dsLoading } = useLoadDataSource();
  const { rules, loadingRules } = useLoadRules();
  const { datapoints, isLoading: loadingDatapoints } = useLoadDatapoints({
    target: 'dataSource',
    rules,
  });

  const noRules = rules.length === 0;
  const isLoading = dsLoading || loadingDatapoints || loadingRules;
  const isDisabled =
    noRules ||
    !dataSource ||
    emptyDatapoints(datapoints) ||
    validationStatus !== 'Success';

  const disabledMessage = useDisabledMessage(
    rules,
    datapoints,
    validationStatus,
    dataSource
  );

  return { disabledMessage, isDisabled, isLoading };
};

const useDisabledMessage = (
  rules: RuleDto[],
  datapoints: Datapoints[],
  validationStatus: ValidationStatus,
  dataSource?: DataSourceDto
) => {
  const { t } = useTranslation('useDisabledMessage');

  // TODO consider access control here too
  if (!dataSource) return t('data_quality_report_disabled_no_datasource', '');

  if (rules.length === 0) return t('data_quality_report_disabled_no_rules', '');

  if (emptyDatapoints(datapoints))
    return t('data_quality_report_disabled_no_score', '');

  if (validationStatus === 'InProgress')
    return t('data_quality_report_disabled_validation_in_progress', '');

  if (validationStatus === 'Error')
    return t('data_quality_report_disabled_validation_error', '');

  return '';
};
