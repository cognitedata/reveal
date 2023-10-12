import { Select, SelectProps } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useDatasetsListQuery } from '@data-exploration-lib/domain-layer';

export const DatasetSelector = (
  props: Omit<SelectProps<string>, 'options'>
) => {
  const { data } = useDatasetsListQuery({
    filterArchivedItems: true,
  });

  return (
    <Select
      {...props}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore label is not in data set and I can't send custom option type
      options={data || []}
      getOptionLabel={(option: DataSet) => option.name}
      getOptionValue={(option: DataSet) => option.id}
      menuPortalTarget={document.body}
      // had to override isOptionSelected because Cogs overrides this to just check .value instead of getOptionValue
      isOptionSelected={(option?: DataSet) => option?.id === props.value?.id}
    />
  );
};
