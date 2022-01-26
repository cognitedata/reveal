import { useMemo } from 'react';
import { DataElement, DataElementState } from 'scarlet/types';
import { getDataElementValue } from 'scarlet/utils';

import {
  DataElement as DataElementComponent,
  DataElementListSkeleton,
} from '..';

import { sortDataElements } from './utils';

type DataElementListProps = {
  data?: DataElement[];
  loading: boolean;
  skeletonAmount: number;
  sortedKeys: string[];
};

export const DataElementList = ({
  data,
  loading,
  skeletonAmount,
  sortedKeys,
}: DataElementListProps) => {
  const sortedList = useMemo(
    () =>
      data &&
      [...data]
        .map((dataElement) => ({
          dataElement,
          value: getDataElementValue(dataElement),
        }))
        .sort(sortDataElements(sortedKeys))
        .map((item) => item.dataElement)
        .filter((item) => item.state !== DataElementState.OMITTED),
    [data]
  );

  if (loading) {
    return <DataElementListSkeleton amount={skeletonAmount} />;
  }

  return (
    <>
      {sortedList?.map((item) => (
        <DataElementComponent key={item.key} dataElement={item} />
      ))}
    </>
  );
};
