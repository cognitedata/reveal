import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  COMMON_INFO_CONTENT,
  FilterProps,
  isObjectEmpty,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  AssetFilterType,
  AssetSelectFilter,
  DataSetFilter,
  DateFilter,
  ExternalIdFilter,
  InternalIdFilter,
  MultiSelectFilterValue,
} from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

export const CommonFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const handleChangeAssetSelectFilter = (
    newFilters: MultiSelectFilterValue<number> | undefined,
    assetFilterType: AssetFilterType
  ) => {
    if (assetFilterType === AssetFilterType.AllLinked) {
      return onFilterChange('common', { assetSubtreeIds: newFilters });
    }
    return onFilterChange('common', { assetIds: newFilters });
  };

  return (
    <BaseFilterCollapse.Panel
      title={t('COMMON', 'Common')}
      hideResetButton={isObjectEmpty(filter.common as any)}
      infoContent={t('COMMON_INFO_CONTENT', COMMON_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('common')}
      {...rest}
    >
      <TempMultiSelectFix>
        <DataSetFilter.Common
          value={filter.common.dataSetIds}
          onChange={(newFilters) =>
            onFilterChange('common', { dataSetIds: newFilters })
          }
          addNilOption
        />

        <AssetSelectFilter.Common
          value={{
            [AssetFilterType.AllLinked]: filter.common.assetSubtreeIds,
            [AssetFilterType.DirectlyLinked]: filter.common.assetIds,
          }}
          onChange={handleChangeAssetSelectFilter}
          addNilOption
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
