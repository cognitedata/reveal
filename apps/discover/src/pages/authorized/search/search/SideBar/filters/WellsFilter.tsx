import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import get from 'lodash/get';

import Skeleton from 'components/skeleton';
import { useSearchHasAnyAppliedFilters } from 'hooks/useSearchHasAnyAppliedFilters';
import {
  useClearWellsFilters,
  useSetWellsFiltersAsync,
} from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { useFilterConfigByCategory } from 'modules/wellSearch/hooks/useFilterConfigByCategory';
import { useWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';
import { WellFilterOptionValue, WellFilterMap } from 'modules/wellSearch/types';

import { BaseFilter } from '../components/BaseFilter';
import { FilterCollapse } from '../components/FilterCollapse';

import Header from './common/Header';
import Title from './common/Title';
import { WellIconWrapper, WellIcon } from './elements';
import { CommonFilter } from './well/CommonFilter';
import { TITLE, CATEGORY } from './well/constants';

export const WellsFilter = () => {
  const { isLoading, data: filterOptions } = useWellFilterOptions();
  const [selectedOptions, setSelectedOptions] = useState<WellFilterMap>({});
  // const [changedCategories, setChangedCategories] = useState<SelectedMap>({});
  const [filterCalled, setFilterCalled] = useState<boolean>(false);
  const filters = useAppliedWellFilters();
  const setWellsFilters = useSetWellsFiltersAsync();
  const history = useHistory();
  const anyAppliedFilters = useSearchHasAnyAppliedFilters();
  const clearWellFilters = useClearWellsFilters();
  const filterConfigsByCategory = useFilterConfigByCategory();

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
    filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[]
  ) => {
    setSelectedOptions({
      ...selectedOptions,
      [id]: selectedVals,
    });

    // setChangedCategories((state) => ({ ...state, [filterCategory]: true }));
    setFilterCalled(true);

    const filtersToApply = { ...filters, ...{ [id]: selectedVals } };
    setWellsFilters(filtersToApply).then(() => {
      if (!anyAppliedFilters) {
        history.push('welldata');
      }
    });
  };

  const loader = <Skeleton.List lines={6} borders />;

  const WellFilters: React.FC<{ filterConfigs: any; index: number }> = ({
    filterConfigs,
    index,
  }) => {
    return React.useMemo(
      () =>
        filterConfigs.map((filterConfig: any) => (
          <CommonFilter
            key={filterConfig.id}
            filterConfig={filterConfig}
            onValueChange={(
              id: number,
              selectedVals: WellFilterOptionValue[]
            ) => onValueChange(index, id, selectedVals)}
            options={get(filterOptions, filterConfig.id, [])}
            selectedOptions={selectedOptions[filterConfig.id]}
            displayFilterTitle={filterConfigs.length > 1}
          />
        )),
      [filterConfigs, index]
    );
  };

  const renderFilters = React.useMemo(() => {
    if (isLoading) {
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
        <WellFilters filterConfigs={category.filterConfigs} index={index} />
      </FilterCollapse.Panel>
    ));
  }, [isLoading, filterConfigsByCategory, selectedOptions, filters]);

  return (
    <BaseFilter>
      <Header
        title={TITLE}
        category={CATEGORY}
        handleClearFilters={clearWellFilters}
      />
      <FilterCollapse category="wells">
        {/* Collapsable Panel Elements */}
        {renderFilters}
      </FilterCollapse>
    </BaseFilter>
  );
};

WellsFilter.Title = () => {
  const clearWellFilters = useClearWellsFilters();

  return (
    <Title
      title={TITLE}
      category={CATEGORY}
      iconElement={
        <WellIconWrapper>
          <WellIcon type="OilPlatform" />
        </WellIconWrapper>
      }
      description="Search for wells and wellbores by source, characteristics, events and more"
      handleClearFilters={clearWellFilters}
    />
  );
};
