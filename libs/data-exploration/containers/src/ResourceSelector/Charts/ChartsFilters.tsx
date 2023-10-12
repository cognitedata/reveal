import { useMemo } from 'react';

import { BaseFilterCollapse, FilterLabel } from '@data-exploration/components';

import { SegmentedControl } from '@cognite/cogs.js';

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
} from '@data-exploration-lib/core';

enum FILTER_KEY {
  ALL = 'all',
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const ChartsFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const chartsFilter = filter.charts;
  const isResetButtonVisible = hasObjectAnyProperty(chartsFilter, ['isPublic']);

  const label = t('VISIBILITY', 'Visibility');

  const handleButtonClick = (key: string) => {
    if (key === FILTER_KEY.ALL) {
      onFilterChange('charts', { isPublic: undefined });
    } else {
      onFilterChange('charts', { isPublic: key === FILTER_KEY.PUBLIC });
    }
  };

  const currentKey = useMemo(() => {
    const { isPublic } = chartsFilter;

    if (isPublic === undefined) {
      return FILTER_KEY.ALL;
    }
    if (isPublic) {
      return FILTER_KEY.PUBLIC;
    }

    return FILTER_KEY.PRIVATE;
  }, [chartsFilter]);

  return (
    <BaseFilterCollapse.Panel
      title={t('CHARTS', 'Charts')}
      hideResetButton={!isResetButtonVisible}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('charts')}
      {...rest}
    >
      <div data-testid={`boolean-input-${label}`}>
        {label && <FilterLabel>{label}</FilterLabel>}

        <SegmentedControl
          fullWidth
          currentKey={currentKey}
          onButtonClicked={handleButtonClick}
        >
          <SegmentedControl.Button
            key={FILTER_KEY.PRIVATE}
            data-testid={FILTER_KEY.PRIVATE}
            style={{ flex: 1 }}
          >
            {t('PRIVATE', 'Private')}
          </SegmentedControl.Button>
          <SegmentedControl.Button
            key={FILTER_KEY.PUBLIC}
            data-testid={FILTER_KEY.PUBLIC}
            style={{ flex: 1 }}
          >
            {t('PUBLIC', 'Public')}
          </SegmentedControl.Button>
          <SegmentedControl.Button
            key={FILTER_KEY.ALL}
            data-testid={FILTER_KEY.ALL}
            style={{ flex: 1 }}
          >
            {t('ALL', 'All')}
          </SegmentedControl.Button>
        </SegmentedControl>
      </div>
    </BaseFilterCollapse.Panel>
  );
};
