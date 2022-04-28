import { Dictionary } from '@reduxjs/toolkit';
import convert from 'convert-units';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import { unsafeChangeUnitTo } from 'utils/units';
import { UNITS_TO_STANDARD } from 'utils/units/constants';

import { CogniteEvent } from '@cognite/sdk';
import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { DistanceUnit } from 'constants/units';
import { InspectTabsState } from 'modules/inspectTabs/types';
import {
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from 'modules/wellSearch/constants';

import {
  IdWellboreMap,
  NDSEvent,
  NPTEvent,
  Well,
  Wellbore,
  WellboreEventsMap,
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
        wellboreName:
          wellbores[wellboreId]?.name || wellbores[wellboreId]?.description,
      }));
    })
  );
};

/**
 * This is a serious overkill, all important data of old NDS event is in meta_data. Mapped everything but this is only used for Casing
 * now so not all these are necessary. Most of all this is going to go away when old sdk is removed
 */
export const mapWellInfoToNdsEvents = (
  eventMap: WellboreEventsMap,
  wells: Well[],
  userPreferredUnit: string
): NDSEvent[] => {
  const wellbores = getIdWellboreMap(wells);

  return flatten(
    Object.keys(eventMap).map((wellboreId) => {
      return (eventMap[wellboreId] || []).map((event) => {
        const { metadata } = event;

        const diameterHole = metadata?.diameter_hole;
        const diameterHoleUnit =
          metadata?.diameter_hole_unit || DistanceUnit.FEET;
        const convertedDiameterHole = diameterHole
          ? unsafeChangeUnitTo(
              Number(diameterHole),
              diameterHoleUnit,
              userPreferredUnit
            )
          : undefined;

        const mdHoleEnd = metadata?.md_hole_end;
        const mdHoleEndUnit = metadata?.md_hole_end_unit || DistanceUnit.FEET;
        const convertedMdHoleEnd = mdHoleEnd
          ? unsafeChangeUnitTo(
              Number(mdHoleEnd),
              mdHoleEndUnit,
              userPreferredUnit
            )
          : undefined;

        const mdHoleStart = metadata?.md_hole_start;
        const mdHoleStartUnit =
          metadata?.md_hole_start_unit || DistanceUnit.FEET;
        const convertedMdHoleStart = mdHoleStart
          ? unsafeChangeUnitTo(
              Number(mdHoleStart),
              mdHoleStartUnit,
              userPreferredUnit
            )
          : undefined;

        const tvdOffsetHoleEnd = metadata?.tvd_offset_hole_end;
        const tvdOffsetHoleEndUnit =
          metadata?.tvd_offset_hole_end_unit || DistanceUnit.FEET;
        const convertedTvdOffsetHoleEnd = tvdOffsetHoleEnd
          ? unsafeChangeUnitTo(
              Number(tvdOffsetHoleEnd),
              tvdOffsetHoleEndUnit,
              userPreferredUnit
            )
          : undefined;

        const tvdOffsetHoleStart = metadata?.tvd_offset_hole_start;
        const tvdOffsetHoleStartUnit =
          metadata?.tvd_offset_hole_start_unit || DistanceUnit.FEET;
        const convertedTvdOffsetHoleStart = tvdOffsetHoleStart
          ? unsafeChangeUnitTo(
              Number(tvdOffsetHoleStart),
              tvdOffsetHoleStartUnit,
              userPreferredUnit
            )
          : undefined;

        return {
          ...event,
          metadata: {
            ...event.metadata,
            diameter_hole: convertedDiameterHole
              ? String(convertedDiameterHole)
              : '',
            diameter_hole_unit: userPreferredUnit,
            md_hole_end: convertedMdHoleEnd ? String(convertedMdHoleEnd) : '',
            md_hole_end_unit: userPreferredUnit,
            md_hole_start: convertedMdHoleStart
              ? String(convertedMdHoleStart)
              : '',
            md_hole_start_unit: userPreferredUnit,
            tvd_offset_hole_end: convertedTvdOffsetHoleEnd
              ? String(convertedTvdOffsetHoleEnd)
              : '',
            tvd_offset_hole_end_unit: userPreferredUnit,
            tvd_offset_hole_start: convertedTvdOffsetHoleStart
              ? String(convertedTvdOffsetHoleStart)
              : '',
            tvd_offset_hole_start_unit: userPreferredUnit,
          },
          riskType: event.subtype || '',
          wellboreId,
          wellName: wellbores[wellboreId]?.metadata?.wellName,
          wellboreName:
            wellbores[wellboreId]?.name || wellbores[wellboreId]?.description,
        };
      });
    })
  );
};

export const getNPTFilterOptions = (events: NPTEvent[]) => {
  const nptCodes: string[] = [];
  const nptDetailCodes: string[] = [];
  let min = 0;
  let max = 0;
  events.forEach((event) => {
    const { nptCode, nptCodeDetail } = event;
    if (nptCode && !nptCodes.includes(nptCode)) {
      nptCodes.push(nptCode);
    }
    if (nptCodeDetail && !nptDetailCodes.includes(nptCodeDetail)) {
      nptDetailCodes.push(nptCodeDetail);
    }

    if (event?.duration) {
      if (min > event?.duration) {
        min = event.duration;
      }
      if (max < event?.duration) {
        max = event.duration;
      }
    }
  });
  return {
    nptCodes,
    nptDetailCodes,
    minMaxDuration: [Math.floor(min), Math.ceil(max)],
  };
};

const filterByName = (event: NPTEvent, searchPhrase: string) =>
  isEmpty(searchPhrase) ||
  includes(event.wellName, searchPhrase) ||
  includes(event.wellboreName, searchPhrase);

const filterByDuration = (event: NPTEvent, duration: number[]) => {
  if (!duration) return false;

  const eventNPTDuration = event?.duration || 0;
  const [min, max] = duration;

  return eventNPTDuration >= min && eventNPTDuration <= max;
};

const filterByNptCode = (event: NPTEvent, nptCode: string[]) =>
  isEmpty(nptCode) || includes(nptCode, event.nptCode);

const filterByNptDetailCode = (event: NPTEvent, nptDetailCode: string[]) =>
  isEmpty(nptDetailCode) || includes(nptDetailCode, event.nptCodeDetail);

export const getFilteredNPTEvents = (
  events: NPTEvent[],
  nptFilters: InspectTabsState['npt']
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
