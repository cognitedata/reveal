import React from 'react';

import { SidebarFilters } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceType } from '@cognite/data-exploration';

import { useFlagDocumentsApiEnabled } from '../../hooks';
import { useQueryString } from '../../hooks/hooks';
import { useAllFilters } from '../../store';
import { SEARCH_KEY } from '../../utils/constants';

// import { useFilterState } from 'providers';

// interface IFilterIcon {
//   filter: FilterType;
// }

// const FilterIconWithCount = ({ filter }: IFilterIcon) => {
//   const filterCount = countByFilter(filter);
//   if (filterCount !== 0) {
//     return <Badge count={filterCount}></Badge>;
//   }

//   return null;
// };

const TRANSITION_TIME = 200;
const DEFAULT_VISIBLE_VALUE = true;

interface Props {
  resourceType?: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
  enableDocumentLabelsFilter?: boolean;
}

export const SearchFiltersV2: React.FC<Props> = ({
  visible = DEFAULT_VISIBLE_VALUE,
  // allowHide = true,
  // closeFilters = () => {},
  resourceType,
  enableDocumentLabelsFilter,
}) => {
  // const handleFilterChange = (
  //   resourceType: ResourceType,
  //   updatingData: unknown
  // ) => {};
  const { state, setter, resetter } = useAllFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: visible ? 302 : 0,
        marginLeft: 1,
        borderRight: `1px solid var(--cogs-border--muted)`,
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && (
        <SidebarFilters
          enableDocumentLabelsFilter={enableDocumentLabelsFilter}
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          resourceType={resourceType}
          onFilterChange={(type, nextFilter) => {
            setter(type, nextFilter);
          }}
          filter={state}
          onResetFilterClick={(type) => {
            resetter(type);
          }}
          query={debouncedQuery}
        />
      )}
    </div>
  );
};
