import keyBy from 'lodash/keyBy';
import orderBy from 'lodash/orderBy';

type FilterDataType = {
  value: string;
  count?: number;
};

export const mergeDynamicFilterOptions = <T extends FilterDataType>(
  data: T[],
  dynamicData: T[]
) => {
  const keyedDynamicData = keyBy(dynamicData, 'value');

  const unsortedOptions = data.map((item) => ({
    label: String(item.value),
    value: String(item.value),
    count: keyedDynamicData[item.value]?.count || 0,
  }));

  return orderBy(unsortedOptions, 'count', 'desc');
};
