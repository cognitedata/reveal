import React from 'react';
import { ResourceType } from '@cognite/data-exploration';
import { useAllFilters } from '../../store/filter/selectors/allSelectors';
import { SidebarFilters } from '@data-exploration/containers';

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
  enableAdvancedFilters?: boolean;
}

export const SearchFiltersV2: React.FC<Props> = ({
  visible = DEFAULT_VISIBLE_VALUE,
  // allowHide = true,
  // closeFilters = () => {},
  resourceType,
}) => {
  // const handleFilterChange = (
  //   resourceType: ResourceType,
  //   updatingData: unknown
  // ) => {};
  const { state, setter, resetter } = useAllFilters();

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
          resourceType={resourceType}
          onFilterChange={(type, nextFilter) => {
            setter(type, nextFilter);
          }}
          filter={state}
          onResetFilterClick={(type) => {
            resetter(type);
          }}
        />
      )}
    </div>
  );
};
