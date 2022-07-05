import { Icon, Input, Skeleton } from '@cognite/cogs.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SortOrder, UnitListItem } from 'types';
import { useApi, useHomePageContext } from 'hooks';
import { generatePath, useHistory } from 'react-router-dom';
import { PAGES } from 'pages/Menubar';
import { getNumberEquipmentsPerUnit } from 'api';

import { SortOrderButton } from '..';

import * as Styled from './style';

const skeletonList = Array.from(Array(100).keys());

type UnitNavigationProps = {
  showFacilities: () => void;
};

export const UnitNavigation = ({ showFacilities }: UnitNavigationProps) => {
  const activeUnitRef = useRef<HTMLButtonElement>(null);
  const history = useHistory();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState(SortOrder.ASCENDING);
  const { homePageState } = useHomePageContext();
  const { state: numberEquipmentsPerUnitQuery } = useApi<
    Record<number, number>
  >(getNumberEquipmentsPerUnit, {
    unitIds: homePageState.unitListQuery.data?.map((item) => item.cdfId),
  });

  useEffect(() => {
    const unitButton = activeUnitRef.current;
    const scrollContainer = unitButton?.parentElement?.parentElement;
    if (unitButton && scrollContainer) {
      const { offsetTop, offsetHeight: unitHeight } = unitButton;
      const { clientHeight, scrollTop } = scrollContainer;

      if (
        offsetTop < scrollTop ||
        offsetTop > scrollTop + clientHeight - unitHeight / 2
      ) {
        scrollContainer.scrollTo({
          top: offsetTop - 16,
          left: 0,
        });
      }
    }
  }, [activeUnitRef.current]);

  const onChange = (unit: UnitListItem) => {
    history.replace(
      generatePath(PAGES.UNIT, {
        facility: homePageState.facility!.path,
        unitId: unit.id,
      })
    );
  };

  const sortedUnitList = useMemo(() => {
    const filter = search.trim().toLocaleLowerCase();
    const compareFn = (a: UnitListItem, b: UnitListItem) =>
      sortOrder === SortOrder.ASCENDING
        ? a.number - b.number
        : b.number - a.number;

    return (
      homePageState.unitListQuery.data
        ?.filter((unit) =>
          `${unit.id} Unit ${unit.number}`.toLocaleLowerCase().includes(filter)
        )
        .sort(compareFn) || []
    );
  }, [homePageState.unitListQuery, search, sortOrder]);

  const { loading } = homePageState.unitListQuery;

  return (
    <>
      <Styled.BackButtonContainer>
        <Styled.BackButton
          icon="ChevronLeftLarge"
          iconPlacement="left"
          type="ghost"
          block
          onClick={showFacilities}
        >
          Back
        </Styled.BackButton>
      </Styled.BackButtonContainer>
      <Styled.Plant>
        <div className="cogs-micro">Plant</div>
        <h2 className="cogs-title-2">{homePageState.facility?.shortName}</h2>
      </Styled.Plant>
      <Styled.SearchContainer>
        <Input
          placeholder="Unit name"
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
        {loading ? (
          <Skeleton.Rectangle width="50px" height="20px" />
        ) : (
          <span className="cogs-body-2 strong">
            {sortedUnitList.length === 1
              ? '1 unit'
              : `${sortedUnitList.length} units`}
          </span>
        )}
        <SortOrderButton sortOrder={sortOrder} onChange={setSortOrder} />
      </Styled.TopBar>
      <Styled.ContentWrapper>
        <Styled.ScrollContainer>
          {loading &&
            skeletonList.map((key) => (
              <Skeleton.Rectangle
                key={key}
                width="100%"
                height="82px"
                style={{ margin: 0 }}
              />
            ))}
          {!loading && (
            <Styled.List>
              {sortedUnitList.map((unit) => {
                const isActive = unit.id === homePageState.unitId;
                const numberEquipments =
                  numberEquipmentsPerUnitQuery.data?.[unit.cdfId] || 0;
                const disabled =
                  !numberEquipmentsPerUnitQuery.loading && !numberEquipments;
                return (
                  <Styled.ListItem
                    key={unit.id}
                    disabled={disabled}
                    active={isActive}
                    ref={isActive ? activeUnitRef : null}
                    onClick={() => !isActive && !disabled && onChange(unit)}
                  >
                    <Styled.ListItemContent>
                      <h4 className="cogs-title-4">Unit {unit.number}</h4>
                      {numberEquipmentsPerUnitQuery.loading ? (
                        <Styled.NumberEquipments className="cogs-body-2">
                          <Icon type="Loader" />
                          equipment
                        </Styled.NumberEquipments>
                      ) : (
                        <div className="cogs-body-2">
                          {numberEquipments.toLocaleString('en-US')} equipment
                        </div>
                      )}
                    </Styled.ListItemContent>
                    {isActive && <Icon type="ChevronRightLarge" size={14} />}
                  </Styled.ListItem>
                );
              })}
            </Styled.List>
          )}
        </Styled.ScrollContainer>
      </Styled.ContentWrapper>
    </>
  );
};
