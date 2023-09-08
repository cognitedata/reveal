import { DataSourceDto, RuleDto } from '@data-quality/api/codegen';
import {
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
export const useReportAvailability = () => {
  const { dataSource, isLoading: dsLoading } = useLoadDataSource();
  const { rules, loadingRules } = useLoadRules();
  const { datapoints, isLoading: loadingDatapoints } = useLoadDatapoints({
    target: 'dataSource',
    rules,
  });

  const noRules = rules.length === 0;
  const noDataSourceValidity = !dataSource || emptyDatapoints(datapoints);

  const isLoading = dsLoading || loadingDatapoints || loadingRules;
  const isDisabled = noRules || noDataSourceValidity;

  const disabledMessage = useDisabledMessage(rules, datapoints, dataSource);

  return { disabledMessage, isDisabled, isLoading };
};

const useDisabledMessage = (
  rules: RuleDto[],
  datapoints: Datapoints[],
  dataSource?: DataSourceDto
) => {
  const { t } = useTranslation('useDisabledMessage');

  let disabledMessage = t(
    'data_quality_report_disabled',
    'Cannot download report'
  );

  // TODO consider access control here too
  if (!dataSource)
    disabledMessage = t(
      'data_quality_report_disabled_ds',
      'Cannot download report. No datasource was found.'
    );

  if (rules.length === 0)
    disabledMessage = t(
      'data_quality_report_disabled_rules',
      'Cannot download report. No rules were found.'
    );

  if (emptyDatapoints(datapoints))
    disabledMessage = t(
      'data_quality_report_disabled_score',
      'Cannot download report. Validate now to get the total validity score of your data.'
    );

  return disabledMessage;
};
