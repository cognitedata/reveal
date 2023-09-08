import { useListAllRules } from '@data-quality/api/codegen';
import { useLoadDataSource, useLoadDatapoints } from '@data-quality/hooks';

/** Load all the rules and their timeseries + datapoints in a datasource. */
export const useLoadRules = () => {
  const { dataSource } = useLoadDataSource();

  const {
    data: rulesData,
    isLoading: rulesLoading,
    error: rulesError,
    refetch,
  } = useListAllRules(
    {
      pathParams: {
        dataSourceId: dataSource?.externalId,
      },
    },
    { enabled: !!dataSource?.externalId }
  );

  const rules = rulesData?.items || [];

  const { datapoints, isLoading: loadingDatapoints } = useLoadDatapoints({
    target: 'rules',
    rules,
  });

  return {
    datapoints,
    error: rulesError,
    loadingDatapoints,
    loadingRules: rulesLoading,
    refetchRules: refetch,
    rules,
  };
};
