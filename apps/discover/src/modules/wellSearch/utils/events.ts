import { Dictionary } from '@reduxjs/toolkit';
import convert from 'convert-units';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { UNITS_TO_STANDARD } from 'utils/units/constants';

import { CogniteEvent } from '@cognite/sdk';
import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { FilterDataState } from 'modules/filterData/types';
import {
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from 'modules/wellSearch/constants';

import {
  IdWellboreMap,
  NPTEvent,
  Well,
  Wellbore,
  WellboreNPTEventsMap,
} from '../types';

export const mapWellInfo = (
  events: CogniteEvent[],
  wells: Well[]
): CogniteEvent[] => {
  const wellbores = groupBy(
    flatten(
      wells.map((well) =>
        (well.wellbores || []).map((wellbore) => ({
          ...wellbore,
          metadata: {
            ...(wellbore.metadata || {}),
            wellName: well.name,
          },
        }))
      )
    ),
    'id'
  );
  return events.map((event) => {
    const eventWellbore = getWellbore(event, wellbores);
    return {
      ...event,
      metadata: {
        ...get(event, 'metadata', {}),
        wellName: get(eventWellbore, 'metadata.wellName'),
        wellboreName: get(eventWellbore, 'description', ''),
      },
    };
  });
};

export const getWellbore = (
  event: CogniteEvent,
  wellbores: Dictionary<Wellbore[]>
) => {
  const eventWellboreId = event.assetIds?.length
    ? head(event.assetIds)
    : undefined;

  if (!eventWellboreId || !wellbores[eventWellboreId]) return null;

  return head(wellbores[eventWellboreId]);
};

export const getIdWellboreMap = (wells: Well[]): IdWellboreMap => {
  return flatten(
    wells.map((well) =>
      (well.wellbores || []).map((wellbore) => ({
        ...wellbore,
        metadata: {
          ...(wellbore.metadata || {}),
          wellName: well.name,
        },
      }))
    )
  ).reduce(
    (wellboresMap, wellbore) => ({
      ...wellboresMap,
      [wellbore.id]: wellbore,
    }),
    {}
  );
};

// @sdk-wells-v3
export const mapWellInfoToNPTEvents = (
  eventsMap: WellboreNPTEventsMap,
  wells: Well[],
  userPreferredUnit?: string
): NPTEvent[] => {
  const wellbores = getIdWellboreMap(wells);

  return flatten(
    Object.keys(eventsMap).map((key) => {
      const wellboreId = key as any;
      return (eventsMap[wellboreId] || []).map((event) => ({
        ...event,
        measuredDepth: event.measuredDepth
          ? {
              ...event.measuredDepth,
              value: convert(event.measuredDepth.value)
                .from(
                  UNITS_TO_STANDARD[
                    event.measuredDepth.unit as DistanceUnitEnum
                  ] || event.measuredDepth.unit
                )
                .to(userPreferredUnit as any),
            }
          : undefined,
        nptCode: isEmpty(event.nptCode) ? UNKNOWN_NPT_CODE : event.nptCode,
        nptCodeDetail: isEmpty(event.nptCodeDetail)
          ? UNKNOWN_NPT_DETAIL_CODE
          : event.nptCodeDetail,
        wellboreId,
        wellName: wellbores[wellboreId]?.metadata?.wellName,
        wellboreName: wellbores[wellboreId]?.description,
      }));
    })
  );
};

export const getNPTFilterOptions = (events: NPTEvent[]) => {
  const nptCodes: string[] = [];
  const nptDetailCodes: string[] = [];
  let min: number | null = null;
  let max: number | null = null;
  events.forEach((event) => {
    const { nptCode, nptCodeDetail } = event;
    if (nptCode && !nptCodes.includes(nptCode)) {
      nptCodes.push(nptCode);
    }
    if (nptCodeDetail && !nptDetailCodes.includes(nptCodeDetail)) {
      nptDetailCodes.push(nptCodeDetail);
    }
    if (min === null || min > event.duration) {
      min = event.duration;
    }
    if (max === null || max < event.duration) {
      max = event.duration;
    }
  });
  return {
    nptCodes,
    nptDetailCodes,
    minMaxDuration: [
      min === null ? 0 : Math.floor(min),
      max === null ? 0 : Math.ceil(max),
    ],
  };
};

const filterByName = (event: NPTEvent, searchPhrase: string) =>
  isEmpty(searchPhrase) ||
  includes(event.wellName, searchPhrase) ||
  includes(event.wellboreName, searchPhrase);

const filterByDuration = (event: NPTEvent, duration: number[]) => {
  if (!duration) return false;

  const eventNPTDuration = event.duration;
  const [min, max] = duration;

  return eventNPTDuration >= min && eventNPTDuration <= max;
};

const filterByNptCode = (event: NPTEvent, nptCode: string[]) =>
  isEmpty(nptCode) || includes(nptCode, event.nptCode);

const filterByNptDetailCode = (event: NPTEvent, nptDetailCode: string[]) =>
  isEmpty(nptDetailCode) || includes(nptDetailCode, event.nptCodeDetail);

export const getFilteredNPTEvents = (
  events: NPTEvent[],
  nptFilters: FilterDataState['npt']
) => {
  const { searchPhrase, duration, nptCode, nptDetailCode } = nptFilters;

  return events.filter((event) => {
    return (
      filterByName(event, searchPhrase) &&
      filterByDuration(event, duration) &&
      filterByNptCode(event, nptCode) &&
      filterByNptDetailCode(event, nptDetailCode)
    );
  });
};
