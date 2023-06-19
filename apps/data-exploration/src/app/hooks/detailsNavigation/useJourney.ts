import { useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import qs from 'query-string';

import {
  getJourneyItemFromString,
  getStringFromJourneyItem,
  Journey,
  JourneyItem,
  JOURNEY_FIELD,
  JOURNEY_SEPARATOR,
  SELECTED_TAB_FIELD,
  VIEW_MODE_FIELD,
} from '@data-exploration-lib/core';

// Get/Set journeys to the url from a Journey object.
export const useJourney = (): [Journey, (journey: Journey) => void] => {
  const { search, pathname } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const journeyValue = searchParams.get(JOURNEY_FIELD);

  const journey: Journey = useMemo(() => {
    const rawJourneyItems = journeyValue?.split(JOURNEY_SEPARATOR);
    return rawJourneyItems?.map((item: string) => {
      return getJourneyItemFromString(item);
    });
  }, [journeyValue]);

  const setJourneySearchParam = useCallback(
    (journey: Journey) => {
      const stringifiedJourneys: string[] | undefined = journey?.map(
        (item: JourneyItem) => {
          return getStringFromJourneyItem(item);
        }
      );
      const stringifiedJourney = stringifiedJourneys?.join(JOURNEY_SEPARATOR);

      // Using 'searchParams` from the 'useSearchParams' hook is not a viable option here.
      // https://github.com/remix-run/react-router/issues/9757
      // https://stackoverflow.com/questions/70698899/why-does-react-router-v6-seem-unable-to-remove-query-string-param-from-url
      const params = new URLSearchParams(window.location.search);
      const parsedParams = qs.parse(params.toString());

      // TODO: move this out to a function?
      if (!Boolean(stringifiedJourney) || stringifiedJourney === undefined) {
        const {
          // Here we remove the fields related to a journey!
          [JOURNEY_FIELD]: journey,
          [VIEW_MODE_FIELD]: viewMode,
          [SELECTED_TAB_FIELD]: selectedTab,
          ...paramsWithoutJourney
        } = parsedParams;
        setSearchParams(qs.stringify(paramsWithoutJourney));
      } else {
        setSearchParams(() => {
          // Remove selected tab param when a new item is added or removed from the journey.
          const {
            [SELECTED_TAB_FIELD]: selectedTab,
            ...paramsWithoutSelectedTab
          } = parsedParams;

          const itemSelectedTab = (journey || []).find(
            (item) => !!item.selectedTab
          );

          const journeyParams = {
            ...paramsWithoutSelectedTab,
            [JOURNEY_FIELD]: stringifiedJourney,
            [SELECTED_TAB_FIELD]: itemSelectedTab
              ? itemSelectedTab.selectedTab
              : undefined,
          };
          return qs.stringify(journeyParams);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, pathname]
  );

  return [journey, setJourneySearchParam];
};

// Clears journeys and close the details overlay.
export const useEndJourney = (): [() => void] => {
  const [, setJourney] = useJourney();
  const endJourney = () => {
    setJourney(undefined);
  };

  return [endJourney];
};

// Returns length of the current journey.
export const useJourneyLength = (): [number] => {
  const [journey] = useJourney();
  const journeyLength = journey ? journey.length : 0;
  return [journeyLength];
};
