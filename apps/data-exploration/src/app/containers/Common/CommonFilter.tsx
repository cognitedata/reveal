import React from 'react';

import { DateFilterV2, StringFilterV2 } from '@data-exploration/containers';

import {
  ResourceType,
  DataSetFilterV2,
  ByAssetFilterV2,
  NumberFilter,
} from '@cognite/data-exploration';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useFlagAdvancedFilters } from '../../hooks';
import {
  useCommonFilters,
  useFilterEmptyState,
  useResetCommonFilters,
} from '../../store';
import { COMMON_INFO_CONTENT } from '../constants';
import { TempCommonMultiSelectFix } from '../elements';

interface Props {
  resourceType?: ResourceType;
}
export const CommonFilter: React.FC<Props> = ({ resourceType, ...rest }) => {
  const [commonFilter, setCommonFilter] = useCommonFilters();
  const resetCommonFilter = useResetCommonFilters();
  const isFiltersEmpty = useFilterEmptyState('common');

  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  return (
    <BaseFilterCollapse.Panel
      title="Common"
      hideResetButton={isFiltersEmpty}
      infoContent={COMMON_INFO_CONTENT}
      onResetClick={resetCommonFilter}
      {...rest}
    >
      <TempCommonMultiSelectFix>
        <DataSetFilterV2
          resourceType={resourceType}
          value={commonFilter.dataSetIds}
          setValue={(newValue) => setCommonFilter({ dataSetIds: newValue })}
        />
        <ByAssetFilterV2
          value={commonFilter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={(newValue) =>
            setCommonFilter({ assetSubtreeIds: newValue })
          }
        />
        <DateFilterV2
          title="Created time"
          value={commonFilter.createdTime}
          setValue={(newValue) =>
            setCommonFilter({ createdTime: newValue || undefined })
          }
        />
        <DateFilterV2
          title="Updated time"
          value={commonFilter.lastUpdatedTime}
          setValue={(newValue) =>
            setCommonFilter({ lastUpdatedTime: newValue || undefined })
          }
        />
        {/* WIP */}
        {/* <MetadataFilter
          items={[]}
          value={commonFilter.metadata}
          setValue={newValue => onChange({ metadata: newValue })}
        /> */}
        <StringFilterV2
          title="External ID"
          value={commonFilter.externalIdPrefix}
          setValue={(newValue) =>
            setCommonFilter({ externalIdPrefix: newValue })
          }
        />
        {isAdvancedFiltersEnabled && (
          <NumberFilter
            title="Internal ID"
            value={commonFilter.internalId}
            setValue={(newValue) =>
              setCommonFilter({
                internalId: newValue,
              })
            }
          />
        )}
      </TempCommonMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
