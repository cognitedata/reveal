import { Flex } from '@cognite/cogs.js';
import { Select, Input } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { TARGET_TABLE_QUERY_KEY } from 'common/constants';
import AssetTable from 'components/resource-selector-table/AssetTable';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { useAllDataSets } from 'hooks/datasets';

type Props = {};

export default function TargetSelectionTable({}: Props) {
  const { t } = useTranslation();
  const { targetsList, setTargetsList } = useQuickMatchContext();

  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;
  const { data: datasets, isInitialLoading } = useAllDataSets({
    select(items) {
      return items.map(({ id, name }) => ({
        value: id,
        label: name || id.toString(),
      }));
    },
  });

  return (
    <Flex direction="column">
      <Flex direction="row" gap={12}>
        <Select
          placeholder={t('resource-type-datasets')}
          style={{ width: 120 }}
          loading={isInitialLoading}
          options={datasets}
        />
        <Input.Search
          style={{ width: 120 }}
          value={searchParams.get(TARGET_TABLE_QUERY_KEY) || ''}
          onChange={(e) => {
            searchParams.set(TARGET_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
        />
      </Flex>
      <AssetTable
        query={searchParams.get(TARGET_TABLE_QUERY_KEY)}
        selected={targetsList}
        setSelected={setTargetsList}
      />
    </Flex>
  );
}
