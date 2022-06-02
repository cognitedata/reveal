import { Button } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import { DataElement } from 'scarlet/types';
import { getDataElementValue } from 'scarlet/utils';

import {
  DataElement as DataElementComponent,
  DataElementListSkeleton,
} from '..';

import { sortDataElements } from './utils';

const DATA_ELEMENT_HEIGHT = 64;
const SIDE_OFFSET = 350;
let PARTIAL_LENGTH =
  Math.floor((window.innerHeight - SIDE_OFFSET) / DATA_ELEMENT_HEIGHT) - 1;
if (PARTIAL_LENGTH < 6) {
  PARTIAL_LENGTH = 6;
}

type DataElementListProps = {
  data?: DataElement[];
  loading: boolean;
  skeletonLength: number;
  partial?: boolean;
};

export const DataElementList = ({
  data,
  loading,
  skeletonLength,
  partial = false,
}: DataElementListProps) => {
  const sortedList = useMemo(
    () =>
      (data &&
        [...data]
          .map((dataElement) => ({
            dataElement,
            value: getDataElementValue(dataElement),
            label: dataElement.config.label || dataElement.key,
          }))
          .sort(sortDataElements)
          .map((item) => item.dataElement)) ||
      [],
    [data]
  );
  const isPartialActive = partial && sortedList.length - PARTIAL_LENGTH > 4;
  const [isPartial, setIsPartial] = useState(isPartialActive);
  const visibleDataElements = useMemo(() => {
    if (!isPartial) return sortedList;
    return sortedList?.slice(0, PARTIAL_LENGTH);
  }, [isPartial, sortedList]);

  if (loading) {
    return <DataElementListSkeleton length={skeletonLength} />;
  }

  return (
    <>
      {visibleDataElements?.map((item) => (
        <DataElementComponent key={item.id} dataElement={item} />
      ))}
      {isPartialActive && (
        <Button
          type="tertiary"
          onClick={() => setIsPartial((isPartial) => !isPartial)}
          block
        >
          {isPartial
            ? `Show more (${sortedList.length - visibleDataElements.length})`
            : `Show less`}
        </Button>
      )}
    </>
  );
};
