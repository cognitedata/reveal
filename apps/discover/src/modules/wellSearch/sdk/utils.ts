import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import {
  WaterDepthLimits as WaterDepthLimitsV2,
  SpudDateLimits as SpudDateLimitsV2,
  Well as WellV2,
  WellItems as WellItemsV2,
  PolygonFilter as PolygonFilterV2,
  Wellbore as WellboreV2,
  NPTFilter as NPTFilterV2,
  NPTItems as NPTItemsV2,
  NPT as NPTV2,
  Survey,
  LengthUnitEnum,
} from '@cognite/sdk-wells-v2';
import { DoubleWithUnit } from '@cognite/sdk-wells-v2/dist/src/client/model/DoubleWithUnit';
import {
  SourceItems as SourceItemsV3,
  WaterDepthLimits as WaterDepthLimitsV3,
  SpudDateLimits as SpudDateLimitsV3,
  Well as WellV3,
  WellFilter as WellFilterV3,
  WellFilterRequest,
  WellItems as WellItemsV3,
  PropertyFilter,
  PolygonFilter as PolygonFilterV3,
  GeometryTypeEnum,
  DurationUnitEnum,
  ContainsAllOrAny,
  ContainsAllOrAnyInt,
  Identifier,
  WellItems,
  Wellbore as WellboreV3,
  NptFilter as NPTFilterV3,
  NptItems as NPTItemsV3,
  Npt as NPTV3,
  DurationRange,
  SummaryCount,
} from '@cognite/sdk-wells-v3';

import { CommonWellFilter } from '../types';

export const DEFAULT_DOUBLE_WITH_UNIT: DoubleWithUnit = {
  value: 0,
  unit: '',
};

export const mapV3ToV2SourceItems = (sourceItems: SourceItemsV3) => {
  return sourceItems.items.map((item) => String(item.name));
};

export const mapV3ToV2WellsWaterDepthLimits = (
  waterDepthLimits: WaterDepthLimitsV3
): WaterDepthLimitsV2 => {
  return {
    min: waterDepthLimits.min || DEFAULT_DOUBLE_WITH_UNIT,
    max: waterDepthLimits.max || DEFAULT_DOUBLE_WITH_UNIT,
  };
};

export const mapV3ToV2SpudDateLimits = (
  spudDateLimits: SpudDateLimitsV3
): SpudDateLimitsV2 => {
  return {
    min: new Date(spudDateLimits.min || ''),
    max: new Date(spudDateLimits.max || ''),
  };
};

export const mapSummaryCountsToStringArray = (
  summaryCounts: SummaryCount[]
): string[] => {
  return summaryCounts.map((summaryCount) => summaryCount.property);
};

export const mapV3ToV2Well = (well: WellV3): WellV2 => {
  const wellbores = well.wellbores?.map(mapV3ToV2Wellbore) || [];
  return {
    ...well,
    id: well.matchingId as any,
    spudDate: new Date(well.spudDate || ''),
    wellhead: { id: 0, ...well.wellhead },
    sources: well.sources.map((source) => source.sourceName),
    wellbores: () => Promise.resolve(wellbores),
    _wellbores: wellbores, // This is a backup of wellbores without making them into a promise.
    sourceAssets: () => Promise.resolve([]),
  } as WellV2;
};

export const toPropertyFilter = (
  filter?: string[]
): PropertyFilter | undefined => {
  if (isUndefined(filter)) return undefined;

  return {
    isSet: true,
    oneOf: filter,
  };
};

export const getGeometryAndGeometryType = (polygonFilter: PolygonFilterV2) => {
  if (!isUndefined(polygonFilter.wktGeometry)) {
    return {
      geometry: polygonFilter.wktGeometry,
      geometryType: GeometryTypeEnum.Wkt,
    };
  }

  if (!isUndefined(polygonFilter.geoJsonGeometry)) {
    return {
      geometry: polygonFilter.geoJsonGeometry,
      geometryType: GeometryTypeEnum.GeoJson,
    };
  }

  return {
    geometry: undefined,
    geometryType: undefined,
  };
};

export const mapV2toV3PolygonFilter = (
  polygonFilter?: PolygonFilterV2
): PolygonFilterV3 | undefined => {
  if (isUndefined(polygonFilter)) return undefined;

  const { geometry, geometryType } = getGeometryAndGeometryType(polygonFilter);

  return {
    geometry: JSON.stringify(geometry),
    crs: polygonFilter.crs,
    geometryType,
  };
};

const undefinedIfAllKeysUndefined = (object: object) => {
  const allKeysUndefined = Object.values(object).every(isUndefined);
  return allKeysUndefined ? undefined : object;
};

export const mapV2toV3WellFilter = (
  wellFilter: CommonWellFilter
): WellFilterV3 => {
  const filters = {
    quadrant: toPropertyFilter(wellFilter.quadrants),
    region: toPropertyFilter(wellFilter.regions),
    block: toPropertyFilter(wellFilter.blocks),
    field: toPropertyFilter(wellFilter.fields),
    operator: toPropertyFilter(wellFilter.operators),
    wellType: toPropertyFilter(wellFilter.wellTypes),
    license: toPropertyFilter(wellFilter.licenses),
    sources: wellFilter.sources,
    waterDepth: wellFilter.waterDepth,
    spudDate: undefinedIfAllKeysUndefined({
      min: wellFilter.spudDate?.min?.toISOString(),
      max: wellFilter.spudDate?.max?.toISOString(),
    }),
    polygon: mapV2toV3PolygonFilter(wellFilter.polygon),
    trajectories: undefinedIfAllKeysUndefined({
      maxMeasuredDepth: wellFilter.hasTrajectory?.maxMeasuredDepth,
      maxTrueVerticalDepth: wellFilter.trajectories?.maxTrueVerticalDepth,
      maxDoglegSeverity: wellFilter.trajectories?.maxDoglegSeverity,
    }),
    datum: wellFilter.datum,
  } as WellFilterV3;

  if (wellFilter.npt && !isEmpty(wellFilter.npt)) {
    filters.npt = {
      ...wellFilter.npt,
      exists: true,
      duration: mapDoubleRangeToDurationRange(wellFilter.npt.duration),
    };
  }

  if (wellFilter.nds && !isEmpty(wellFilter.nds)) {
    filters.nds = {
      exists: true,
      severities: toContainsAllOrAnyInt(wellFilter.nds.severities),
      probabilities: toContainsAllOrAnyInt(wellFilter.nds.probabilities),
      riskTypes: toContainsAllOrAny(wellFilter.nds.riskTypes),
    };
  }

  return filters;
};

export const mapWellFilterToWellFilterRequest = (
  wellFilter: CommonWellFilter
): WellFilterRequest => {
  return {
    filter: mapV2toV3WellFilter(wellFilter),
    search: { query: wellFilter.stringMatching || '' },
    outputCrs: undefined,
    limit: undefined,
  };
};

export const mapV3ToV2WellItems = (wellItems: WellItemsV3): WellItemsV2 => {
  return {
    ...wellItems,
    items: wellItems.items.map(mapV3ToV2Well),
  };
};

export const toContainsAllOrAny = (
  items?: string[]
): ContainsAllOrAny | undefined => {
  if (isUndefined(items)) return undefined;
  return { containsAny: items };
};

export const toContainsAllOrAnyInt = (
  items?: number[]
): ContainsAllOrAnyInt | undefined => {
  if (isUndefined(items)) return undefined;
  return { containsAny: items };
};

export const toIdentifier = (id: number | string): Identifier => {
  return { matchingId: String(id) };
};

export const toIdentifierItems = (items: Identifier[]) => {
  return { items };
};

export const extractWellboresFromWells = (response: WellItems) => {
  return flatten(
    response.items.map((item) => item.wellbores || ([] as WellboreV3[]))
  );
};

export const mapV3ToV2Wellbore = (wellbore: WellboreV3): WellboreV2 => {
  return {
    ...wellbore,
    id: wellbore.matchingId as any,
    wellId: wellbore.wellMatchingId as any,
    sourceWellbores: wellbore.sources.map((source) => ({
      id: wellbore.matchingId as any,
      externalId: source.assetExternalId,
      source: source.sourceName,
    })),
    trajectory: () => Promise.resolve({} as Survey),
    casings: () => Promise.resolve([]),
    parentWell: () => Promise.resolve(undefined),
    getWellhead: () => Promise.resolve(undefined),
    sourceAssets: () => Promise.resolve([]),
  };
};

export const mapV2toV3NPTFilter = (nptFilter: NPTFilterV2): NPTFilterV3 => {
  return {
    measuredDepth: nptFilter.measuredDepth,
    duration: mapDoubleRangeToDurationRange(nptFilter.duration),
    nptCode: toPropertyFilter(nptFilter.nptCodes),
    nptCodeDetail: toPropertyFilter(nptFilter.nptCodeDetails),
    wellboreIds: nptFilter.wellboreIds?.map(toIdentifier),
  };
};

export const mapV3ToV2NPTItems = (nptItems: NPTItemsV3): NPTItemsV2 => {
  return {
    ...nptItems,
    items: nptItems.items.map(mapV3ToV2NPT),
  };
};

export const mapV3ToV2NPT = (npt: NPTV3): NPTV2 => {
  return {
    ...npt,
    parentExternalId: npt.wellboreAssetExternalId,
    parentType: '',
    sourceEventExternalId: npt.source.eventExternalId,
    source: npt.source.sourceName,
  };
};

export const mapDoubleRangeToDurationRange = (
  doubleRange?: DoubleRange
): DurationRange | undefined => {
  if (isUndefined(doubleRange)) return undefined;

  return {
    ...doubleRange,
    unit: DurationUnitEnum.Hour, // Since old data contains NPT duration in hours.
  };
};

export const unitToLengthUnitEnum = (unit: string): LengthUnitEnum => {
  switch (unit) {
    case 'ft':
      return LengthUnitEnum.FOOT;
    case 'm':
      return LengthUnitEnum.METER;
    default:
      throw new Error(`Unit (${unit}) is not supported by sdk`);
  }
};
