import { useListLatestRuleRuns } from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';

/** Load all the latest RuleRuns in the current DataSource. */
export const useLoadLatestRuleRuns = () => {
  const { dataSource } = useLoadDataSource();

  const { data, ...rest } = useListLatestRuleRuns(
    {
      pathParams: {
        dataSourceId: dataSource?.externalId,
      },
    },
    {
      enabled: !!dataSource?.externalId,
      refetchInterval: 5000,
    }
  );

  const ruleRuns = data?.items || [];

  return {
    ruleRuns,
    ...rest,
  };
};
