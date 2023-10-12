import { useListLatestRuleRuns } from '../api/codegen';

import { useLoadDataSource } from './';

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
