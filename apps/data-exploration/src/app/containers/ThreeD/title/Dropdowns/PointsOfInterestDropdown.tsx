import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { TableNoResults } from '@cognite/cdf-utilities';

import { useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../../../constants/metrics';
import { trackUsage } from '../../../../utils/Metrics';
import { PointsOfInterestCollection } from '../../hooks';
import { useInfinitePointsOfInterestCollections } from '../../hooks/useInfinitePointsOfInterestCollection';
import { SECONDARY_MODEL_DISPLAY_LIMIT } from '../../utils';
import { PointsOfInterestMenuItem } from '../MenuItems/PointsOfInterestMenuItem';

import {
  MenuWrapper,
  StyledApplyButton,
  StyledFooter,
  StyledInput,
  StyledNoResultsContainer,
  StyledSecondaryObjectListContainer,
} from './Secondary3DModelDropdown';

type PointsOfInterestDropdownProps = {
  internalPointsOfInterestCollections: PointsOfInterestCollection[];
  setInternalPointsOfInterestCollections: Dispatch<
    SetStateAction<PointsOfInterestCollection[]>
  >;
};

const PointsOfInterestDropdown = ({
  internalPointsOfInterestCollections,
  setInternalPointsOfInterestCollections,
}: PointsOfInterestDropdownProps) => {
  const { t } = useTranslation();
  const [
    numberOfPointsOfInterestToDisplay,
    setNumberOfPointsOfInterestToDisplay,
  ] = useState<number>(SECONDARY_MODEL_DISPLAY_LIMIT);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempPointsOfInterestCollections, setTempPointsOfInterestCollections] =
    useState<PointsOfInterestCollection[]>(internalPointsOfInterestCollections);

  const canApplyPointsOfInterest = useMemo(
    () =>
      tempPointsOfInterestCollections.some((tempPOI) =>
        internalPointsOfInterestCollections.some(
          ({ applied, externalId }) =>
            tempPOI.externalId === externalId && tempPOI.applied !== applied
        )
      ),
    [internalPointsOfInterestCollections, tempPointsOfInterestCollections]
  );

  const {
    pointsOfInterestCollections,
    hasNextPage: canFetchMore,
    fetchNextPage: fetchMore,
    isFetchingNextPage: isFetchingMore,
    isFetching,
  } = useInfinitePointsOfInterestCollections();

  const filteredPOIs = useMemo(() => {
    return pointsOfInterestCollections
      .sort((poi1, poi2) => {
        const isPoi1Applied = internalPointsOfInterestCollections.find(
          (poi) => poi.externalId === poi1.externalId
        )?.applied;
        const isPoi2Applied = internalPointsOfInterestCollections.find(
          (poi) => poi.externalId === poi2.externalId
        )?.applied;

        if (isPoi1Applied && !isPoi2Applied) return -1;
        if (!isPoi1Applied && isPoi2Applied) return 1;

        return poi1
          .title!.toLocaleLowerCase()
          .localeCompare(poi2.title!.toLocaleLowerCase());
      })
      .filter(
        ({ pointsOfInterest }) =>
          pointsOfInterest && pointsOfInterest.length > 0
      )
      .filter(({ title }) =>
        title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [
    internalPointsOfInterestCollections,
    pointsOfInterestCollections,
    searchQuery,
  ]);

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  const handleApply = (): void => {
    if (canApplyPointsOfInterest) {
      setInternalPointsOfInterestCollections(tempPointsOfInterestCollections);
      trackUsage(EXPLORATION.THREED_ACTION.POINT_OF_INTEREST_SELECTED, {
        resourceType: '3D',
      });
    }
  };

  const handleChange = (nextState: PointsOfInterestCollection): void => {
    setTempPointsOfInterestCollections((prevState) => [
      ...prevState.filter(
        ({ externalId: prevExternalId }) =>
          nextState.externalId !== prevExternalId
      ),
      nextState,
    ]);

    if (
      !internalPointsOfInterestCollections.some(
        (collection) => nextState.externalId === collection.externalId
      )
    ) {
      setInternalPointsOfInterestCollections((prevState) => {
        return [...prevState, nextState];
      });
    }
  };

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Get next data when 90% of scroll height is reached.
    if (scrollTop + clientHeight >= scrollHeight * 0.9) {
      if (numberOfPointsOfInterestToDisplay < filteredPOIs.length) {
        setNumberOfPointsOfInterestToDisplay(
          numberOfPointsOfInterestToDisplay + SECONDARY_MODEL_DISPLAY_LIMIT
        );
      }
    }
  };

  const isMenuLoading =
    (isFetching || isFetchingMore || canFetchMore) &&
    filteredPOIs.length === 0 &&
    searchQuery === '';

  return (
    <MenuWrapper loading={isMenuLoading}>
      <StyledFooter>
        <StyledInput
          autoFocus
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('SEARCH', 'Search')}
          value={searchQuery || ''}
          onKeyDown={(e) => {
            // Need to stop propagation to fix losing focus
            // Check https://github.com/mui/material-ui/issues/19096#issuecomment-570918052
            e.stopPropagation();
          }}
        />
      </StyledFooter>
      <StyledSecondaryObjectListContainer onScroll={handleScroll}>
        {filteredPOIs.length ? (
          <>
            {filteredPOIs.slice(0, filteredPOIs.length).map((poi) => (
              <PointsOfInterestMenuItem
                key={poi.externalId}
                externalId={poi.externalId}
                title={poi?.title}
                description={poi.description}
                pointsOfInterest={poi.pointsOfInterest}
                onChange={handleChange}
                pointsOfInterestCollection={tempPointsOfInterestCollections.find(
                  ({ externalId }) => externalId === poi.externalId
                )}
              />
            ))}
          </>
        ) : (
          <StyledNoResultsContainer>
            <TableNoResults
              title={t('NO_RESULTS_FOUND', 'No results found')}
              content={t(
                'NO_POINTS_OF_INTEREST_FOUND_TRY_ANOTHER_SEARCH',
                `The search ${searchQuery} did not match any points of interest. Please try another search.`,
                {
                  query: searchQuery,
                }
              )}
            />
          </StyledNoResultsContainer>
        )}
      </StyledSecondaryObjectListContainer>
      <StyledApplyButton
        disabled={!canApplyPointsOfInterest}
        onClick={handleApply}
        type="primary"
      >
        {t('APPLY', 'Apply')}
      </StyledApplyButton>
    </MenuWrapper>
  );
};

export default PointsOfInterestDropdown;
