import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import {
  SdkResourceType,
  useInfiniteList,
  useSearch,
} from '@cognite/sdk-react-query-hooks';
import { stringContains } from './utils';

const { Option } = Select;

type Props = {
  type: SdkResourceType;
  value?: number[];
  filter?: any;
  onChange: (r: number[]) => void;
  useSearchApi?: boolean;
  limit?: number;
  itemFilter?: (item: any) => boolean;
  downloadAll?: boolean;
};
export default function ResourcesSelector({
  type,
  value,
  onChange,
  filter,
  useSearchApi = true,
  limit = 10,
  itemFilter = () => true,
  downloadAll = false,
}: Props) {
  const [search, setSearch] = useState('');
  type R = { name: string; id: number };

  const searchEnabled = useSearchApi && !!search;

  const {
    data: initialOptions,
    isFetching: listing,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteList<R>(type, limit, filter);

  useEffect(() => {
    if (downloadAll && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [downloadAll, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { data: searchOptions, isFetching: searching } = useSearch<R>(
    type,
    search,
    { filter, limit },
    { enabled: searchEnabled }
  );

  const result = (
    (searchEnabled
      ? searchOptions
      : initialOptions?.pages.reduce(
          (accl: R[], page) => accl.concat(page.items),
          []
        )) || []
  ).filter(itemFilter);
  const fetching = searchEnabled ? searching : listing;

  const handleSearch = (searchText: string) => {
    setSearch(searchText);
  };

  return (
    <Select
      mode="tags"
      value={value?.map((i) => `${i}`)}
      placeholder="Search and select resources"
      notFoundContent={fetching ? <Spin /> : 'Not found'}
      onSearch={handleSearch}
      defaultValue={[]}
      onChange={(v) => {
        onChange(v.map((i) => parseInt(i, 10)));
      }}
      style={{ border: 0 }}
      optionLabelProp="title"
      filterOption={
        useSearchApi
          ? false
          : (input, option) => stringContains(option?.title, input)
      }
    >
      {result.map((resource) => (
        <Option
          key={resource.id}
          value={`${resource.id}`}
          title={`${resource.name} (${resource.id})`}
        >
          {`${resource.name} (${resource.id})`}
        </Option>
      ))}
    </Select>
  );
}
