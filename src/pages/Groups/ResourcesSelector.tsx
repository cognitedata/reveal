import React, { useState } from 'react';
import { Select, Spin } from 'antd';
import {
  SdkResourceType,
  useList,
  useSearch,
} from '@cognite/sdk-react-query-hooks';

const { Option } = Select;

type Props = {
  type: SdkResourceType;
  value?: number[];
  body?: any;
  onChange: (r: number[]) => void;
  useSearchApi?: boolean;
  prefetchItems?: number;
  itemFilter?: (item: any) => boolean;
};
export default function ResourcesSelector({
  type,
  value,
  onChange,
  body,
  useSearchApi = true,
  prefetchItems = 10,
  itemFilter = () => true,
}: Props) {
  const [search, setSearch] = useState('');
  type R = { name: string; id: number };

  const searchEnabled = useSearchApi && !!search;

  const { data: initialOptions, isFetching: listing } = useList<R>(type, {
    ...body,
    limit: prefetchItems,
  });
  const { data: searchOptions, isFetching: searching } = useSearch<R>(
    type,
    search,
    { ...body, limit: prefetchItems },
    { enabled: searchEnabled }
  );

  const result = (
    (searchEnabled ? searchOptions : initialOptions) || []
  ).filter(itemFilter);
  const fetching = searchEnabled ? searching : listing;

  const handleSearch = (searchText: string) => {
    setSearch(searchText);
  };

  return (
    <Select
      mode="multiple"
      value={value}
      placeholder="Search and select resources"
      notFoundContent={fetching ? <Spin /> : 'Not found'}
      onSearch={handleSearch}
      defaultValue={[]}
      onChange={v => onChange(v)}
      style={{ border: 0 }}
      optionLabelProp="title"
      filterOption={
        useSearchApi
          ? false
          : (input, option) =>
              option?.title?.toLowerCase().includes(input?.toLowerCase() || '')
      }
    >
      {result.map(resource => (
        <Option
          key={resource.id}
          value={resource.id}
          title={`${resource.name} (${resource.id})`}
        >
          {`${resource.name} (${resource.id})`}
        </Option>
      ))}
    </Select>
  );
}
