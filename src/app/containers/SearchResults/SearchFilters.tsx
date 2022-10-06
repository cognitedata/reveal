import React from 'react';
import { ResourceType, lightGrey } from '@cognite/data-exploration';
import { Filters } from 'app/containers/Filters';

// import { useFilterState } from 'providers';

const TRANSITION_TIME = 200;
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

export const SearchFilters = ({
  visible = true,
  // allowHide = true,
  // closeFilters = () => {},
  resourceType,
}: // enableFilterFeature,
{
  resourceType: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
}) => {
  // Re-enable all the commented code when 'all filters' is improved by design.

  // const state = useFilterState();

  // const selectedFilter = getSelectedFilter({
  //   resourceType,
  //   assetFilter,
  //   timeseriesFilter,
  //   sequenceFilter,
  //   eventFilter,
  //   fileFilter,
  // } as FiltersWithResourceType);

  // const hasNoFiltersApplied =
  //   isObjectEmpty(assetFilter) &&
  //   isObjectEmpty(eventFilter) &&
  //   isObjectEmpty(timeseriesFilter) &&
  //   isObjectEmpty(fileFilter) &&
  //   isObjectEmpty(sequenceFilter);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: visible ? 260 : 0,
        marginLeft: 1,
        borderRight: `1px solid ${lightGrey}`,
        paddingTop: '18px',
        // paddingRight: '18px',
        visibility: visible ? 'visible' : 'hidden',
        transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease`,
      }}
    >
      {visible && (
        <>
          {/*  
          <ControllerContainer>
            <SegmentedControl
              fullWidth
              currentKey={filterSection}
              onButtonClicked={(key: string) => {
                setFilterSection(key as FilterSection);
              }}
            >
              <SegmentedControl.Button key={FilterSection.AllFilters}>
                All filters
              </SegmentedControl.Button>
              <SegmentedControl.Button
                key={FilterSection.AppliedFilters}
                disabled={hasNoFiltersApplied}
              >
                Applied <FilterIconWithCount filter={selectedFilter} />
              </SegmentedControl.Button>
            </SegmentedControl>
          </ControllerContainer> */}

          <Filters resourceType={resourceType} />
        </>
      )}
    </div>
  );
};

// const IconCol = styled(Col)`
//   margin-right: 16px;
//   padding-right: 16px;
//   border-right: 1px solid ${lightGrey};
// `;

// const HeaderRow = styled(Row)`
//   padding-right: 16px;
//   padding-bottom: 20px;
//   margin-top: 24px;
//   margin-bottom: 16px;
//   border-bottom: 1px solid ${lightGrey};
// `;

// const HideFiltersTooltip = styled(Tooltip)`
//   margin-bottom: 8px;
// `;

// const ControllerContainer = styled.div`
//   padding-right: 16px;
// `;
