import { InternalId } from '@cognite/sdk';
import React from 'react';
import {
  ResourceType,
  DataSetFilterV2,
  ByAssetFilterV2,
  DateFilterV2,
  StringFilterV2,
} from '@cognite/data-exploration';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
// import { MetadataFilter } from '../MetadataFilter/MetadataFilter';
import { useCommonFilters, useResetCommonFilters } from 'app/store/filter';
import { TempCommonMultiSelectFix } from 'app/containers/elements';

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
      <TempCommonMultiSelectFix>
        <DataSetFilterV2
          resourceType={resourceType}
          value={commonFilter.dataSetIds}
          setValue={newValue => setCommonFilter({ dataSetIds: newValue })}
        />
        <ByAssetFilterV2
          value={commonFilter.assetSubtreeIds?.map(el => (el as InternalId).id)}
          setValue={newValue =>
            setCommonFilter({ assetSubtreeIds: newValue?.map(id => ({ id })) })
          }
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
