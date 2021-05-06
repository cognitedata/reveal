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
};
export default function ResourcesSelector({
  type,
  value,
  onChange,
  body,
}: Props) {
  const [search, setSearch] = useState('');
  type R = { name: string; id: number };

  const { data: initialOptions, isFetching: listing } = useList<R>(type, {
    ...body,
    limit: 10,
  });
  const { data: searchOptions, isFetching: searching } = useSearch<R>(
    type,
    search,
    { ...body, limit: 10 },
    { enabled: !!search }
  );

  const result = (search ? searchOptions : initialOptions) || [];
  const fetching = search ? searching : listing;

  const handleSearch = (searchText: string) => {
    setSearch(searchText);
  };
  return (
    <Select
      mode="multiple"
      value={value}
      placeholder="Search and select resources"
      notFoundContent={fetching ? <Spin /> : 'Not found'}
      filterOption={false}
      onSearch={handleSearch}
      onChange={v => onChange(v)}
      style={{ border: 0 }}
    >
      {result.map(resource => (
        <Option key={resource.id} value={resource.id} label={resource.name}>
          {resource.name}
        </Option>
      ))}
    </Select>
  );
}
