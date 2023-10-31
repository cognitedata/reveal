import { Select, SelectProps } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';

import { useDatasetsListQuery } from '@data-exploration-lib/domain-layer';

export const DatasetSelector = (
  props: Omit<SelectProps<string>, 'options'>
) => {
  const { data: capabilities } = useCapabilities();
  const timeSeriesWriteScopedIds: string[] =
    capabilities
      ?.filter(
        (cap) => cap.acl === 'timeSeriesAcl' && cap.actions.includes('WRITE')
      )
      .flatMap((cap) => cap.scope?.datasetScope?.ids) || [];
  const { data } = useDatasetsListQuery({
    filterArchivedItems: true,
  });
  return (
    <Select
      {...props}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore label is not in data set and I can't send custom option type
      options={(data || []).filter((dataset) =>
        timeSeriesWriteScopedIds.includes(`${dataset.id}`)
      )}
      getOptionLabel={(option: DataSet) => option.name}
      getOptionValue={(option: DataSet) => option.id}
      menuPortalTarget={document.body}
      // had to override isOptionSelected because Cogs overrides this to just check .value instead of getOptionValue
      isOptionSelected={(option?: DataSet) => option?.id === props.value?.id}
    />
  );
};
