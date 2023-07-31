import { useSetDocumentFilters } from 'domain/savedSearches/internal/hooks/useSetDocumentFilters';

import React, { useState, useEffect, useMemo } from 'react';

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import styled from 'styled-components/macro';

import { Body, Icon } from '@cognite/cogs.js';
import { DocumentPayload } from '@cognite/discover-api-types';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { DocumentQueryFacets } from 'modules/documentSearch/types';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';
import { FlexAlignItems, sizes } from 'styles/layout';

import Checkboxes, { CheckboxState } from '../../components/Checkboxes';
import { FilterCollapse } from '../../components/FilterCollapse';

const extractSelectedFiltersName = (
  filter: CheckboxState[],
  forceNameUsage = false
) => {
  return filter
    .filter((item) => item.selected)
    .map((item) => {
      return forceNameUsage ? item.name : item.id || item.name;
    });
};

const ChevronCollapseUpDownIcon = styled(Icon)<{
  props: { expanded: number };
}>`
  transition: transform 0.2s;
  transform: ${(
    { expanded }: { expanded: number } // throw an error for boolean check. hence use number
  ) => (expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;

const ViewMoreContainer = styled(FlexAlignItems)`
  cursor: pointer;
  margin-left: -8px;
  margin-bottom: 8px;
`;

const ViewMore: React.FC<{
  expanded: boolean;
  onShowMoreClick: () => void;
}> = ({ expanded, onShowMoreClick }) => (
  <ViewMoreContainer onClick={onShowMoreClick}>
    <ChevronCollapseUpDownIcon expanded={expanded ? 1 : 0} type="ChevronDown" />
    <Body level={2}>{expanded ? 'View less' : 'View more'}</Body>
  </ViewMoreContainer>
);

interface Props {
  title: string;
  docQueryFacetType: Exclude<
    keyof DocumentQueryFacets,
    'lastmodified' | 'lastcreated'
  >;
  categoryData: DocumentPayload[];
  category: CategoryTypes;
  defaultNumberOfItemsToDisplay?: number;
}
export const CheckboxFilter: React.FC<Props> = React.memo(
  ({
    title,
    docQueryFacetType,
    categoryData: categoryDataOriginal,
    defaultNumberOfItemsToDisplay,
    ...rest
  }) => {
    const appliedFilters = useFilterAppliedFilters();
    const metrics = useGlobalMetrics('search');
    const [showApplyButton, setShowApplyButton] = useState(false);
    const [activeFilters, setFilters] = useState<CheckboxState[]>([]);
    const [isShowMoreExpanded, setIsShowMoreExpanded] = useState(false);
    const { data: generalConfig } = useProjectConfigByKey('general');
    const setDocumentFilters = useSetDocumentFilters();

    const currentFilterStateFacets = get(
      appliedFilters.documents,
      docQueryFacetType,
      []
    );

    const handleApplyFilters = async (filters: CheckboxState[]) => {
      // map the filters, because we need the special format for labels accepted
      let value: string[] | { externalId: string }[] =
        extractSelectedFiltersName(filters);

      metrics.track('click-sidebar-document-filter', {
        filter: title,
        value,
      });

      // map it going out so we save the right query in the api
      if (docQueryFacetType === 'labels') {
        value = value.map((id) => ({ externalId: id }));
      }

      setDocumentFilters(
        {
          ...appliedFilters.documents,
          [docQueryFacetType]: value,
        },
        appliedFilters.extraDocumentsFilters
      );
      setShowApplyButton(false);
    };

    const handleSelectedFilterSelection = (data: string[]) => {
      handleApplyFilters(
        activeFilters.map((filter) => {
          return { ...filter, selected: data.includes(filter.name) };
        })
      );
    };

    // Not to display options without any name in the sidebar filters
    const categoryData = useMemo(
      () => categoryDataOriginal.filter((data) => data.name.trim()),
      [categoryDataOriginal]
    );

    useEffect(() => {
      if (!categoryData) {
        return;
      }

      const transformAddSelectedAndIncludeStateInfo = categoryData.reduce(
        (accumulator: CheckboxState[], item: DocumentPayload) => {
          if (!item) {
            return accumulator;
          }

          const isFilterItemPersistentlySelected =
            currentFilterStateFacets.some((currentFacet: any) => {
              if (!currentFacet) {
                return false;
              }

              if (currentFacet.externalId) {
                return currentFacet.externalId === item.id;
              }

              return currentFacet === item.name;
            });

          return [
            ...accumulator,
            {
              ...item,
              selected: isFilterItemPersistentlySelected,
            },
          ];
        },
        []
      );
      if (!isEqual(transformAddSelectedAndIncludeStateInfo, activeFilters)) {
        setFilters(transformAddSelectedAndIncludeStateInfo);
      }
    }, [categoryData, currentFilterStateFacets]);

    const getCheckboxesData = React.useCallback(
      (data: CheckboxState[]) => {
        return !isShowMoreExpanded && defaultNumberOfItemsToDisplay
          ? data.slice(0, defaultNumberOfItemsToDisplay)
          : data;
      },
      [isShowMoreExpanded, defaultNumberOfItemsToDisplay]
    );

    const checkboxesData = React.useMemo(
      () => getCheckboxesData(activeFilters),
      [getCheckboxesData, activeFilters]
    );

    const showViewMoreButton =
      defaultNumberOfItemsToDisplay &&
      defaultNumberOfItemsToDisplay < activeFilters.length;
    const renderViewMoreButton = React.useMemo(() => {
      if (showViewMoreButton) {
        return (
          <ViewMore
            expanded={isShowMoreExpanded}
            onShowMoreClick={() => {
              setIsShowMoreExpanded(!isShowMoreExpanded);
            }}
          />
        );
      }

      return null;
    }, [showViewMoreButton, isShowMoreExpanded]);

    return (
      <FilterCollapse.Panel
        title={title}
        showApplyButton={showApplyButton}
        handleApplyClick={() => {
          handleApplyFilters(activeFilters);
        }}
        {...rest}
      >
        <>
          <Checkboxes
            data={checkboxesData}
            onValueChange={handleSelectedFilterSelection}
            hideResultsCount={generalConfig?.hideFilterCount}
          />
          {renderViewMoreButton}
        </>
      </FilterCollapse.Panel>
    );
  }
);
