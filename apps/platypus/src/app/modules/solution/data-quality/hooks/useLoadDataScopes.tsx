import { useListDataScopes } from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';

// TODO consider getting the amount of rules connected to each data scope
// TODO use this hook when upserting a rule
/** Load all the data scopes in a datasource. */
export const useLoadDataScopes = () => {
  const { dataSource } = useLoadDataSource();

  const { data, ...rest } = useListDataScopes(
    {
      pathParams: {
        dataSourceId: dataSource?.externalId,
      },
    },
    { enabled: !!dataSource?.externalId }
  );

  const dataScopes = data?.items || [];

  return {
    dataScopes,
    ...rest,
  };
};
