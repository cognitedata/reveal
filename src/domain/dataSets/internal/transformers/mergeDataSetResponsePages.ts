import { InfiniteData } from 'react-query';
import { DataSetInternal } from '../types';

export const mergeDataSetResponsePages = (
  data?: InfiniteData<{ items: DataSetInternal[] }>
) => {
  const pages = data?.pages || [];

  const mergedPages = pages.reduce((accumulator, { items }) => {
    return [...accumulator, ...items];
  }, [] as DataSetInternal[]);

  return [...mergedPages].sort((a, b) => a.id - b.id);
};
