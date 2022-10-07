import { InternalId } from '@cognite/sdk';
import React from 'react';
import {
  ByAssetFilter,
  DataSetFilter,
  ResourceType,
  DateFilter,
  StringFilter,
} from '@cognite/data-exploration';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
// import { MetadataFilter } from '../MetadataFilter/MetadataFilter';
import { useCommonFilters, useResetCommonFilters } from 'app/store/filter';

interface Props {
  resourceType: ResourceType;
}
export const CommonFilter: React.FC<Props> = ({ resourceType, ...rest }) => {
  const [commonFilter, setCommonFilter] = useCommonFilters();
  const resetCommonFilter = useResetCommonFilters();

  return (
    <BaseFilterCollapse.Panel
      title="Common"
      onResetClick={resetCommonFilter}
      {...rest}
    >
      <DataSetFilter
        resourceType={resourceType}
        value={commonFilter.dataSetIds}
        setValue={newValue => setCommonFilter({ dataSetIds: newValue })}
      />
      <ByAssetFilter
        value={commonFilter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setCommonFilter({ assetSubtreeIds: newValue?.map(id => ({ id })) })
        }
      />
      <DateFilter
        title="Created Time"
        value={commonFilter.createdTime}
        setValue={newValue =>
          setCommonFilter({ createdTime: newValue || undefined })
        }
      />
      <DateFilter
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
      <StringFilter
        title="External ID"
        value={commonFilter.externalIdPrefix}
        setValue={newValue => setCommonFilter({ externalIdPrefix: newValue })}
      />
    </BaseFilterCollapse.Panel>
  );
};
