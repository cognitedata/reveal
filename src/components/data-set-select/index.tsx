import { toast } from '@cognite/cogs.js';
import { Select } from 'antd';
import { useTranslation } from 'common';
import { useDataSets } from 'hooks/datasets';
import { useEffect, useMemo } from 'react';
import { API } from 'types/api';

type Props = { api: API; onChange: (e: number) => void; selected?: number };
export function DataSetSelect({ api, onChange, selected }: Props) {
  const { t } = useTranslation();
  const { data: datasets = [], isInitialLoading, error } = useDataSets(api);

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

  useEffect(() => {
    if (error) {
      toast.error(t('dataset-error-body', { error: error.message }), {
        toastId: `dataset-error-${api}`,
      });
    }
  }, [error, api, t]);

  return (
    <Select
      showSearch
      allowClear
      placeholder={t('resource-type-datasets')}
      style={{ width: 220 }}
      loading={isInitialLoading}
      optionFilterProp="label"
      options={items}
      value={selected}
      onChange={onChange}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
