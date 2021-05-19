import React, { useEffect, useState } from 'react';
import {
  SelectableItemsProps,
  TableStateProps,
  TableProps,
  SearchResultLoaderProps,
  RelatedResourcesLoaderProps,
} from '@cognite/data-exploration';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResultTableLoader = <T extends Resource>({
  children,
  ...props
}: {
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SearchResultLoaderProps> &
  Partial<RelatedResourcesLoaderProps> &
  Partial<SelectableItemsProps> &
  TableStateProps) => {
  const [fileData, setFileData] = useState<FileInfo[]>([]);

  useEffect(() => {
    (async () => {
      const fileSearchResult = await sdkv3.files.search({
        filter: props.filter,
        search: { name: props.query },
        limit: 100,
      });
      setFileData(fileSearchResult);
    })();
  }, [props.query, props.filter]);

  return <>{children({ data: fileData })}</>;
};
