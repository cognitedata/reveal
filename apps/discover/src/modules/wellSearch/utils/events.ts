import { Well } from 'domain/wells/well/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { Dictionary } from '@reduxjs/toolkit';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import { unsafeChangeUnitTo } from 'utils/units';

import { DistanceUnit } from 'constants/units';
import { CogniteEventV3ish } from 'modules/wellSearch/types';

import { IdWellboreMap, NDSEvent, WellboreEventsMap } from '../types';

export const mapWellInfo = (
  events: CogniteEventV3ish[],
  wells: Well[]
): CogniteEventV3ish[] => {
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
  event: CogniteEventV3ish,
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
