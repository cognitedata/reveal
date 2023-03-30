import {
  COMMON_INFO_CONTENT,
  FilterProps,
  isObjectEmpty,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  AssetSelectFilter,
  DataSetFilter,
  DateFilter,
  ExternalIdFilter,
  InternalIdFilter,
} from '../../../src/Filters';

export const CommonFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Common"
      hideResetButton={isObjectEmpty(filter.common as any)}
      infoContent={COMMON_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('common')}
      {...rest}
    >
      <TempMultiSelectFix>
        <DataSetFilter.Common
          value={filter.common.dataSetIds}
          onChange={(newFilters) =>
            onFilterChange('common', { dataSetIds: newFilters })
          }
        />

        <AssetSelectFilter.Common
          value={filter.common.assetSubtreeIds}
          onChange={(newFilters) =>
            onFilterChange('common', { assetSubtreeIds: newFilters })
          }
        />

        <DateFilter.Created
          value={filter.common.createdTime}
          onChange={(newValue) =>
            onFilterChange('common', {
              createdTime: newValue || undefined,
            })
          }
        />

        <DateFilter.Updated
          value={filter.common.lastUpdatedTime}
          onChange={(newValue) =>
            onFilterChange('common', {
              lastUpdatedTime: newValue || undefined,
            })
          }
        />

        <ExternalIdFilter
          value={filter.common.externalIdPrefix}
          onChange={(idPrefix) =>
            onFilterChange('common', { externalIdPrefix: idPrefix })
          }
        />

        <InternalIdFilter
          value={filter.common.internalId}
          onChange={(id) => onFilterChange('common', { internalId: id })}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
