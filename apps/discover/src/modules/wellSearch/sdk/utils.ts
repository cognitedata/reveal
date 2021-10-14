import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import pickBy from 'lodash/pickBy';

import {
  WaterDepthLimits as WaterDepthLimitsV2,
  SpudDateLimits as SpudDateLimitsV2,
  Well as WellV1,
  WellFilter as WellFilterV2,
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
  StringItems,
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
} from '@cognite/sdk-wells-v3';

export const DEFAULT_DOUBLE_WITH_UNIT: DoubleWithUnit = {
  value: 0,
  unit: '',
};

export const mapV2ToV1SourceItems = (sourceItems: SourceItemsV3) => {
  return sourceItems.items.map((item) => String(item.name));
};

export const mapV2ToV1WellsWaterDepthLimits = (
  waterDepthLimits: WaterDepthLimitsV3
): WaterDepthLimitsV2 => {
  return {
    min: waterDepthLimits.min || DEFAULT_DOUBLE_WITH_UNIT,
    max: waterDepthLimits.max || DEFAULT_DOUBLE_WITH_UNIT,
  };
};

export const mapV2ToV1SpudDateLimits = (
  spudDateLimits: SpudDateLimitsV3
): SpudDateLimitsV2 => {
  return {
    min: new Date(spudDateLimits.min || ''),
    max: new Date(spudDateLimits.max || ''),
  };
};

export const mapStringItemsToStringArray = (
  stringItems: StringItems
): string[] => {
  return stringItems.items;
};

export const mapV2ToV1Well = (well: WellV3): WellV1 => {
  return {
    ...well,
    id: well.matchingId as any,
    spudDate: new Date(well.spudDate || ''),
    wellhead: { id: 0, ...well.wellhead },
    sources: well.sources.map((source) => source.sourceName),
    wellbores: () =>
      Promise.resolve(well.wellbores?.map(mapV2ToV1Wellbore) || []),
    sourceAssets: () => Promise.resolve([]),
  };
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

export const mapV1ToV2PolygonFilter = (
  polygonFilter?: PolygonFilterV2
): PolygonFilterV3 | undefined => {
  if (isUndefined(polygonFilter)) return undefined;

  const { geometry, geometryType } = getGeometryAndGeometryType(polygonFilter);

  return {
    geometry: String(geometry),
    crs: polygonFilter.crs,
    geometryType,
  };
};

export const mapV1ToV2WellFilter = (wellFilter: WellFilterV2): WellFilterV3 => {
  return {
    quadrant: toPropertyFilter(wellFilter.quadrants),
    block: toPropertyFilter(wellFilter.blocks),
    field: toPropertyFilter(wellFilter.fields),
    operator: toPropertyFilter(wellFilter.operators),
    wellType: toPropertyFilter(wellFilter.wellTypes),
    license: toPropertyFilter(wellFilter.licenses),
    sources: wellFilter.sources,
    waterDepth: wellFilter.waterDepth,
    spudDate: {
      min: wellFilter.spudDate?.min?.toDateString(),
      max: wellFilter.spudDate?.max?.toDateString(),
    },
    polygon: mapV1ToV2PolygonFilter(wellFilter.polygon),
    npt: {
      ...wellFilter.npt,
      exists: !isEmpty(pickBy(wellFilter.npt)),
      duration: mapDoubleRangeToDurationRange(wellFilter.npt?.duration),
    },
    nds: {
      exists: !isEmpty(pickBy(wellFilter.nds)),
      severities: toContainsAllOrAnyInt(wellFilter.nds?.severities),
      probabilities: toContainsAllOrAnyInt(wellFilter.nds?.probabilities),
      riskTypes: toContainsAllOrAny(wellFilter.nds?.riskTypes),
    },
  };
};

export const mapWellFilterToWellFilterRequest = (
  wellFilter: WellFilterV2
): WellFilterRequest => {
  return {
    filter: mapV1ToV2WellFilter(wellFilter),
    search: { query: wellFilter.stringMatching || '' },
    outputCrs: undefined,
    limit: undefined,
  };
};

export const mapV2ToV1WellItems = (wellItems: WellItemsV3): WellItemsV2 => {
  return {
    ...wellItems,
    items: wellItems.items.map(mapV2ToV1Well),
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
  return {
    items,
    ignoreUnknownIds: true,
  };
};

export const extractWellboresFromWells = (response: WellItems) => {
  return flatten(
    response.items.map((item) => item.wellbores || ([] as WellboreV3[]))
  );
};

export const mapV2ToV1Wellbore = (wellbore: WellboreV3): WellboreV2 => {
  return {
    ...wellbore,
    id: wellbore.matchingId as any,
    wellId: wellbore.wellMatchingId as any,
    sourceWellbores: wellbore.sources.map((source) => ({
      id: 0,
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

export const mapV1toV2NPTFilter = (nptFilter: NPTFilterV2): NPTFilterV3 => {
  return {
    measuredDepth: nptFilter.measuredDepth,
    duration: mapDoubleRangeToDurationRange(nptFilter.duration),
    nptCode: toPropertyFilter(nptFilter.nptCodes),
    nptCodeDetail: toPropertyFilter(nptFilter.nptCodeDetails),
    wellboreIds: nptFilter.wellboreIds?.map(toIdentifier),
  };
};

export const mapV2ToV1NPTItems = (nptItems: NPTItemsV3): NPTItemsV2 => {
  return {
    ...nptItems,
    items: nptItems.items.map(mapV2ToV1NPT),
  };
};

export const mapV2ToV1NPT = (npt: NPTV3): NPTV2 => {
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
