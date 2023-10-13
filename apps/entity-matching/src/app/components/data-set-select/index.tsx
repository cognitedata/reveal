import { useEffect, useMemo } from 'react';

import styled from 'styled-components';

import { Select } from 'antd';

import { Colors, Flex, toast } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { useDataSets } from '../../hooks/datasets';
import { API } from '../../types/api';

type Props = {
  api: API;
  onChange: (e: number) => void;
  selected?: number;
  dataTestId?: string;
};

const { Option } = Select;

const NumberFormat = new Intl.NumberFormat(undefined);

export function DataSetSelect({ api, onChange, selected, dataTestId }: Props) {
  const { t } = useTranslation();
  const {
    data: datasets = [],
    isInitialLoading,
    error,
  } = useDataSets(api === 'files' ? 'documents' : api);

  const items = useMemo(
    () =>
      datasets.map((ds) => ({
        label: `${ds.name || ds.id.toString()}`,
        value: ds.id,
        count: ds.count,
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
      value={selected}
      onChange={onChange}
      filterOption={(input, option) =>
        `${option?.label}`.toLowerCase().includes(input.toLowerCase())
      }
      data-testid={dataTestId}
    >
      {items.map(({ value, label, count }) => (
        <Option value={value} key={value} label={label}>
          <Flex gap={8} justifyContent="space-between">
            <div style={{ overflow: 'hidden' }}>{label}</div>
            {count && <Count>{NumberFormat.format(count)}</Count>}
          </Flex>
        </Option>
      ))}
    </Select>
  );
}

const Count = styled.div`
  color: ${Colors['text-icon--muted']};
`;
