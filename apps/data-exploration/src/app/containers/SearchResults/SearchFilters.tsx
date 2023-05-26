import React from 'react';

import { Filters } from '@data-exploration-app/containers/Filters';

import { ResourceType } from '@cognite/data-exploration';

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

export const SearchFilters = ({
  visible = DEFAULT_VISIBLE_VALUE,
  // allowHide = true,
  // closeFilters = () => {},
  resourceType,
  enableAdvancedFilters,
}: {
  resourceType?: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
  enableAdvancedFilters?: boolean;
}) => {
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
        <Filters
          resourceType={resourceType}
          enableAdvancedFilters={enableAdvancedFilters}
        />
      )}
    </div>
  );
};
