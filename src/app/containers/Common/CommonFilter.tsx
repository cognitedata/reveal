import React from 'react';
import {
  ResourceType,
  DataSetFilterV2,
  ByAssetFilterV2,
  DateFilterV2,
  StringFilterV2,
} from '@cognite/data-exploration';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useCommonFilters,
  useFilterEmptyState,
  useResetCommonFilters,
} from 'app/store/filter';
import { TempCommonMultiSelectFix } from 'app/containers/elements';

interface Props {
  resourceType: ResourceType;
}
export const CommonFilter: React.FC<Props> = ({ resourceType, ...rest }) => {
  const [commonFilter, setCommonFilter] = useCommonFilters();
  const resetCommonFilter = useResetCommonFilters();
  const isFiltersEmpty = useFilterEmptyState('common');

  return (
    <BaseFilterCollapse.Panel
      title="Common"
      hideResetButton={isFiltersEmpty}
      onResetClick={resetCommonFilter}
      {...rest}
    >
      <TempCommonMultiSelectFix>
        <DataSetFilterV2
          resourceType={resourceType}
          value={commonFilter.dataSetIds?.map(({ value }) => value)}
          setValue={newValue => setCommonFilter({ dataSetIds: newValue })}
        />
        <ByAssetFilterV2
          value={commonFilter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={newValue => setCommonFilter({ assetSubtreeIds: newValue })}
        />
        <DateFilterV2
          title="Created Time"
          value={commonFilter.createdTime}
          setValue={newValue =>
            setCommonFilter({ createdTime: newValue || undefined })
          }
        />
        <DateFilterV2
          title="Updated Time"
          value={commonFilter.lastUpdatedTime}
          setValue={newValue =>
            setCommonFilter({ lastUpdatedTime: newValue || undefined })
          }
        />
        {/*  WIP
      <MetadataFilter
        items={[]}
        value={commonFilter.metadata}
        setValue={newValue => onChange({ metadata: newValue })}
      /> */}
        <StringFilterV2
          title="External ID"
          value={commonFilter.externalIdPrefix}
          setValue={newValue => setCommonFilter({ externalIdPrefix: newValue })}
        />
      </TempCommonMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
