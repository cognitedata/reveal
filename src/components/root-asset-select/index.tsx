import { Select } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { useSearch } from 'hooks/search';
import { useMemo, useState } from 'react';

type Props = {
  onChange: (e: number) => void;
  selected?: number;
};

export default function RootAssetSelect({ onChange, selected }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { data: listItems = [], isInitialLoading: listLoading } = useList(
    'assets',
    {
      limit: 1000,
      filter: { root: true },
    }
  );

  const { data: searchItems = [], isInitialLoading: searchLoading } = useSearch(
    'assets',
    { query },
    {
      limit: 1000,
      filter: { root: true },
    },
    { enabled: !!query }
  );

  const items = useMemo(() => {
    const items = !!query ? searchItems : listItems;
    return items.map((asset) => ({
      label: `${asset.name || asset.id.toString()}`,
      value: asset.id,
    }));
  }, [listItems, searchItems, query]);

  return (
    <Select
      allowClear
      showSearch
      placeholder={t('resource-type-root-asset', {
        count: 0,
      })}
      style={{ width: 220 }}
      loading={!!query ? searchLoading : listLoading}
      optionFilterProp="label"
      options={items}
      value={selected}
      onChange={onChange}
      onSearch={(q) => setQuery(q)}
    />
  );
}
