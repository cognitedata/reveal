import React, { useState, useEffect } from 'react';

import get from 'lodash/get';

import Skeleton from 'components/skeleton';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  useClearWellsFilters,
  useSetWellsFiltersAsync,
} from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { Modules } from 'modules/sidebar/types';
import { useFilterConfigByCategory } from 'modules/wellSearch/hooks/useFilterConfigByCategory';
import { useWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';
import {
  WellFilterOptionValue,
  WellFilterMap,
  FilterConfig,
} from 'modules/wellSearch/types';

import { BaseFilter } from '../../components/BaseFilter';
import { FilterCollapse } from '../../components/FilterCollapse';
import Header from '../common/Header';

import { CommonFilter } from './CommonFilter';
import { TITLE, CATEGORY } from './constants';
import { Title } from './Title';

const loader = <Skeleton.List lines={6} borders />;

export const WellsFilter = () => {
  const { isFetching, data: filterOptions } = useWellFilterOptions();
  const [selectedOptions, setSelectedOptions] = useState<WellFilterMap>({});
  // const [changedCategories, setChangedCategories] = useState<SelectedMap>({});
  const [filterCalled, setFilterCalled] = useState<boolean>(false);
  const filters = useAppliedWellFilters();
  const setWellsFilters = useSetWellsFiltersAsync();
  const clearWellFilters = useClearWellsFilters();
  const filterConfigsByCategory = useFilterConfigByCategory();
  const metrics = useGlobalMetrics('search');

  useEffect(() => {
    /**
     * Trick to avoid updating the selected options state when updating the filter state from this Filter Panel.
     * But selected options state will update when the filter state update externally.
     */
    if (filterCalled) {
      setFilterCalled(false);
    } else {
      // setChangedCategories({});
      setSelectedOptions(filters);
    }
  }, [filters]);

  const onValueChange = (
    _filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[],
    filterGroupName: string
  ) => {
    setSelectedOptions({
      ...selectedOptions,
      [id]: selectedVals,
    });

    // setChangedCategories((state) => ({ ...state, [filterCategory]: true }));
    setFilterCalled(true);
    metrics.track('click-sidebar-wells-filter', {
      filter: filterGroupName,
      value: selectedVals,
    });

    const filtersToApply = { ...filters, ...{ [id]: selectedVals } };
    setWellsFilters(filtersToApply);
  };

  // eg: "Well Characteristics"
  const WellFilters: React.FC<{
    filterConfigs: FilterConfig[];
    index: number;
  }> = ({ filterConfigs, index }) => {
    return React.useMemo(
      () => (
        <>
          {filterConfigs.map((filterConfig) => {
            return (
              <CommonFilter
                key={filterConfig.id}
                filterConfig={filterConfig}
                onValueChange={(
                  id: number,
                  selectedVals: WellFilterOptionValue[]
                ) => onValueChange(index, id, selectedVals, filterConfig.name)}
                options={get(filterOptions, filterConfig.id, [])}
                selectedOptions={selectedOptions[filterConfig.id]}
                displayFilterTitle={filterConfigs.length > 1}
              />
            );
          })}
        </>
      ),
      [filterConfigs, index]
    );
  };

  const renderFilters = React.useMemo(() => {
    if (isFetching) {
      return loader;
    }

    return filterConfigsByCategory.map((category, index) => (
      <FilterCollapse.Panel
        title={category.title}
        // showApplyButton={changedCategories[index]}
        // handleApplyClick={() => applyFilters(index)}
        key={category.title}
      >
        {/* Filter Elements */}
        <div data-testid={category.title}>
          <WellFilters filterConfigs={category.filterConfigs} index={index} />
        </div>
      </FilterCollapse.Panel>
    ));
  }, [
    isFetching,
    filterConfigsByCategory,
    selectedOptions,
    filters,
    filterOptions,
  ]);

  return (
    <BaseFilter>
      <Header
        title={TITLE}
        category={CATEGORY}
        handleClearFilters={clearWellFilters}
      />
      <FilterCollapse category={Modules.WELLS}>
        {/* Collapsable Panel Elements */}
        {renderFilters}
      </FilterCollapse>
    </BaseFilter>
  );
};

WellsFilter.Title = Title;
