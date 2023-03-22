import { OptionType } from '@data-exploration/components';
import head from 'lodash/head';

export const transformMetadataKeysToOptions = (
  data?: {
    count: number;
    values: string[];
  }[]
) => {
  return (data || []).map((item) => ({
    label: head(item.values),
    value: head(item.values),
    count: item.count,
  })) as OptionType[];
};
