import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import useSelector from '@platypus-app/hooks/useSelector';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useFilteredRowsCount({
  dataModelExternalId,
  dataModelType,
  space,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  space: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const filter = useSelector((state) => state.dataManagement.filter);
  const dataModelVersion = useSelector(
    (state) => state.dataModel.selectedDataModelVersion
  );
  const aggregationsQueryKey = QueryKeys.FILTERED_ROWS_COUNT(
    space,
    dataModelExternalId,
    dataModelType.name,
    dataModelVersion?.version || '',
    filter
  );

  return useQuery<number, PlatypusError>(
    aggregationsQueryKey,
    () => {
      return dataManagementHandler
        .fetchFilteredRowsCount({
          dataModelId: dataModelExternalId,
          dataModelType,
          space,
          version: dataModelVersion?.version || '',
          filter: filter ? filter : null,
        })
        .then((res) => res.getValue());
    },
    {
      enabled:
        !!dataModelExternalId &&
        !!dataModelType &&
        !!space &&
        !!dataModelVersion,
    }
  );
}
