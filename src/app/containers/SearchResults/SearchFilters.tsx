import React from 'react';
import { ResourceType } from '@cognite/data-exploration';
import { Filters } from 'app/containers/Filters';

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
}: // enableFilterFeature,
{
  resourceType?: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
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
      {visible && <Filters resourceType={resourceType} />}
    </div>
  );
};
