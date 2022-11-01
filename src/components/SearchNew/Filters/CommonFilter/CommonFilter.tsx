import React from 'react';
import { ResourceType } from 'types';
import { BaseFilterCollapse } from '../BaseFilterCollapse/BaseFilterCollapse';
import { DateFilterV2 } from '../DateFilter/DateFilter';
// import { MetadataFilter } from '../MetadataFilter/MetadataFilter';
import { StringFilterV2 } from '../StringFilter/StringFilter';
import { CommonFilterFacets } from '../types';

interface Props {
  resourceType: ResourceType;
  commonFilter: CommonFilterFacets;
  onChange: (newValue: CommonFilterFacets) => void;
}
export const CommonFilter: React.FC<Props> = ({
  commonFilter,
  onChange,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel title="Common" {...rest}>
      {/* <DataSetFilterV2
        resourceType={resourceType}
        value={commonFilter.dataSetIds}
        setValue={newValue => onChange({ dataSetIds: newValue })}
      /> */}
      {/* <ByAssetFilterV2
        value={commonFilter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          onChange({ assetSubtreeIds: newValue?.map(id => ({ id })) })
        }
      /> */}
      <DateFilterV2
        title="Created Time"
        value={commonFilter.createdTime}
        setValue={newValue => onChange({ createdTime: newValue || undefined })}
      />
      <DateFilterV2
        title="Updated Time"
        value={commonFilter.lastUpdatedTime}
        setValue={newValue =>
          onChange({ lastUpdatedTime: newValue || undefined })
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
        setValue={newValue => onChange({ externalIdPrefix: newValue })}
      />
    </BaseFilterCollapse.Panel>
  );
};
