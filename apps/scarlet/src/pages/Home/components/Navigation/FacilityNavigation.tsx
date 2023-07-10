import { Icon, Input, Skeleton } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import { Facility, SortOrder } from 'types';
import { useAppState } from 'hooks';

import { SortOrderButton } from '..';

import * as Styled from './style';

type FacilityNavigationProps = {
  onChange: (facility: Facility) => void;
};

export const FacilityNavigation = ({ onChange }: FacilityNavigationProps) => {
  const { facilityList, unitListByFacility } = useAppState();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState(SortOrder.ASCENDING);

  const sortedFacilityList = useMemo(() => {
    const filter = search.trim().toLocaleLowerCase();
    const compareFn =
      sortOrder === SortOrder.DESCENDING
        ? (a: Facility, b: Facility) => (a.shortName < b.shortName ? 1 : -1)
        : (a: Facility, b: Facility) => (a.shortName < b.shortName ? -1 : 1);

    return facilityList.data
      ?.filter((facility) =>
        facility.shortName.toLocaleLowerCase().includes(filter)
      )
      .sort(compareFn);
  }, [search, sortOrder]);

  return (
    <>
      <Styled.Plants>
        <Icon type="OilPlatform" size={20} />
        Plants
      </Styled.Plants>
      <Styled.SearchContainer>
        <Input
          placeholder="Plant name"
          iconPlacement="left"
          value={search}
          icon="Search"
          fullWidth
          onChange={({ target: { value } }) => setSearch(value)}
          clearable={{
            callback: () => {
              setSearch('');
            },
          }}
        />
      </Styled.SearchContainer>
      <Styled.TopBar>
        <span className="cogs-body-2 strong">
          {sortedFacilityList.length === 1
            ? '1 plant'
            : `${sortedFacilityList.length} plants`}
        </span>
        <SortOrderButton sortOrder={sortOrder} onChange={setSortOrder} />
      </Styled.TopBar>

      <Styled.ContentWrapper>
        <Styled.ScrollContainer>
          <Styled.List>
            {sortedFacilityList.map((facility) => {
              const amount = unitListByFacility.data?.[facility.id].length;
              return (
                <Styled.ListItem key={facility.id}>
                  <Styled.ListItemContent onClick={() => onChange(facility)}>
                    <h4 className="cogs-title-4">{facility.shortName}</h4>
                    {unitListByFacility.loading && (
                      <Skeleton.Rectangle width="60px" height="20px" />
                    )}
                    {amount !== undefined && (
                      <div className="cogs-body-2">{amount} units</div>
                    )}
                  </Styled.ListItemContent>
                </Styled.ListItem>
              );
            })}
          </Styled.List>
        </Styled.ScrollContainer>
      </Styled.ContentWrapper>
    </>
  );
};
