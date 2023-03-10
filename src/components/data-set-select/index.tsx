import { Select } from 'antd';
import { useTranslation } from 'common';
import { useDataSets } from 'hooks/datasets';
import { useMemo } from 'react';
import { API } from 'types/api';

type Props = { api: API; onChange: (e: number[]) => void; selected?: number[] };
export function DataSetSelect({ api, onChange, selected }: Props) {
  const { t } = useTranslation();
  // TODO: error
  const { data: datasets = [], isInitialLoading } = useDataSets(api);

  const items = useMemo(
    () =>
      datasets.map((ds) => ({
        label: `${ds.name || ds.id.toString()} ${
          Number.isFinite(ds.count) ? `(${ds.count})` : ''
        }`,
        value: ds.id,
      })),
    [datasets]
  );

  return (
    <Select
      mode="multiple"
      allowClear
      placeholder={t('resource-type-datasets', {
        count: 0,
      })}
      style={{ width: 220 }}
      loading={isInitialLoading}
      optionFilterProp="label"
      options={items}
      value={selected?.map(
        (s) => items?.find((i) => i.value === s)?.value || s
      )}
      onChange={onChange}
    />
  );
}
