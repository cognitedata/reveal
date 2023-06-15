/* eslint-disable no-nested-ternary */
import {
  QueryPreviewData,
  QueryPreviewSuccess,
  Warning,
} from '@transformations/hooks';
import { DataModel } from '@transformations/hooks/fdm';
import { Count } from '@transformations/hooks/profiling-service';
import { ScheduleStatus } from '@transformations/pages/transformation-list/TransformationList';
import {
  ConflictMode,
  Destination,
  isFDMDestination,
  ResourceType,
  Schema,
  TransformationRead,
} from '@transformations/types';
import moment from 'moment';

import { getProject } from '@cognite/cdf-utilities';
import { IconType, Colors } from '@cognite/cogs.js';

export const SUPPORTED_ACTIONS_FOR_DESTINATION_TYPES: Record<
  ResourceType,
  ConflictMode[]
> = {
  raw: ['upsert'],
  assets: ['upsert', 'abort', 'update', 'delete'],
  asset_hierarchy: ['upsert', 'delete'],
  events: ['upsert', 'abort', 'update', 'delete'],
  files: ['upsert', 'abort', 'update', 'delete'],
  sequences: ['upsert', 'abort', 'update', 'delete'],
  sequence_rows: ['upsert', 'delete'],
  timeseries: ['upsert', 'abort', 'update', 'delete'],
  datapoints: ['upsert', 'delete'],
  string_datapoints: ['upsert', 'delete'],
  labels: ['abort', 'delete'],
  relationships: ['upsert', 'abort', 'update', 'delete'],
  data_sets: ['abort', 'update', 'upsert'],
  nodes: ['upsert', 'delete'],
  edges: ['upsert', 'delete'],
  instances: ['upsert', 'delete'],
  well_data_layer: ['upsert'],
};

export const getProjectBaseUrl = (): string => {
  const project = getProject();

  return `/api/v1/projects/${project}`;
};

export const getTransformationsApiBaseUrl = (): string => {
  const baseUrl = getProjectBaseUrl();

  return `${baseUrl}/transformations`;
};

export const getTransformationsApiUrl = (path?: string): string => {
  const baseUrl = getTransformationsApiBaseUrl();

  return `${baseUrl}${path ?? ''}`;
};

const lowercase = (str: string = '') => str.toLocaleLowerCase();

export const getFilteredTransformationList = (
  transformationList: TransformationRead[],
  searchValue: string,
  lastRunFilter: string[],
  scheduleFilter: ScheduleStatus[],
  dataSetFilter: string
) => {
  const hasSearch = Boolean(searchValue);
  return transformationList.filter((transformation) => {
    if (hasSearch) {
      // Check if the search matches.
      const includesSearchQuery = lowercase(transformation.name).includes(
        lowercase(searchValue)
      );
      if (!includesSearchQuery) return false;
    }

    if (lastRunFilter) {
      // Check if the status of the transformation matches the filter.
      if (Array.isArray(lastRunFilter)) {
        const includesAppliedFilter =
          !lastRunFilter.length ||
          lastRunFilter.includes(transformation?.lastFinishedJob?.status ?? '');
        if (!includesAppliedFilter) return false;
      } else {
        const includesAppliedFilter =
          transformation?.lastFinishedJob?.status === lastRunFilter;
        if (!includesAppliedFilter) return false;
      }
    }

    if (scheduleFilter) {
      // Check if the status matches any of the options.
      const filterSchedule = (filter: string) =>
        (transformation.blocked && filter === ScheduleStatus.Blocked) ||
        // A transformation might have a schedule, but it can be blocked,
        // for this scenario we need to make sure it isn't blocked, since
        // we display them in the above filter state.
        (!transformation.blocked &&
          transformation.schedule &&
          filter === ScheduleStatus.Scheduled) ||
        // Check if the transformation doesn't have a schedule, and the filter is applied.
        (!transformation.schedule && filter === ScheduleStatus.NotScheduled);

      if (Array.isArray(scheduleFilter)) {
        const includesAppliedFilter =
          !scheduleFilter.length || scheduleFilter.some(filterSchedule);
        if (!includesAppliedFilter) return false;
      } else {
        const includesAppliedFilter = filterSchedule(scheduleFilter);
        if (!includesAppliedFilter) return false;
      }
    }

    if (dataSetFilter) {
      // Check if the dataSetId matches the filter.
      const includesAppliedFilter =
        transformation.dataSetId == Number(dataSetFilter);
      if (!includesAppliedFilter) return false;
    }
    return true;
  });
};

export const getTransformationRawMessageType = (type: string) => {
  let backgroundColor: string;
  let icon: IconType;
  let iconColor: string;
  let border: string;

  switch (type) {
    case 'success':
      backgroundColor = 'rgba(57, 162, 99, 0.06)';
      border = '1px solid rgba(57, 162, 99, 0.2)';
      icon = 'CheckmarkFilled';
      iconColor = Colors['text-icon--status-success'];
      break;
    case 'warning':
      backgroundColor = 'rgba(255, 187, 0, 0.06)';
      border = '1px solid rgba(255, 187, 0, 0.2)';
      icon = 'WarningFilled';
      iconColor = Colors['border--status-warning--strong'];
      break;
    case 'error':
      backgroundColor = 'rgba(223, 58, 55, 0.06)';
      border = '1px solid rgba(223, 58, 55, 0.2)';
      icon = 'ErrorFilled';
      iconColor = Colors['border--status-critical--strong'];
      break;
    case 'loading':
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      border = '1px solid rgba(110, 133, 252, 0.2)';
      icon = 'Loader';
      iconColor = Colors['text-icon--interactive--hover'];
      break;
    case 'info':
    default:
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      border = '1px solid rgba(110, 133, 252, 0.2)';
      icon = 'InfoFilled';
      iconColor = Colors['text-icon--interactive--default'];
      break;
  }

  return { backgroundColor, border, icon, iconColor };
};

export const isDestinationActionSupported = (
  action: ConflictMode,
  type: ResourceType
): boolean => {
  return SUPPORTED_ACTIONS_FOR_DESTINATION_TYPES[type]?.includes(action);
};

/* this util is temporary and will be removed when fdm is integrated into the subapp */
export const isDestinationTypeDMSV2 = (type?: string): boolean => {
  return (
    type === 'data_model_instances' || type === 'alpha_data_model_instances'
  );
};

export const isDestinationTypeUnsupportedDMSV3Type = (
  d: Destination
): boolean => {
  if (isFDMDestination(d)) {
    if (d.type === 'nodes') {
      return !d.view;
    } else if (d.type === 'edges') {
      return !d.edgeType;
    }
  }

  return false;
};

export const reduceHistogramBins = (
  histogram: Count[],
  numberOfBins: number
): Count[] => {
  if (histogram.length < numberOfBins) {
    return histogram;
  }

  const reducedBins: Count[] = [];
  const chunkSize = histogram.length / numberOfBins;
  if (Math.floor(chunkSize) !== chunkSize) {
    return histogram;
  }

  for (let i = 0; i < numberOfBins; i += 1) {
    const chunk = histogram.slice(i * chunkSize, (i + 1) * chunkSize);
    const reducedBin = {
      value: histogram[i * chunkSize].value,
      count: chunk.reduce((acc, cur) => acc + cur.count, 0),
    };
    reducedBins.push(reducedBin);
  }

  return reducedBins;
};

const nameToAclTypeMap = {
  '3d': 'threedAcl',
  assets: 'assetsAcl',
  events: 'eventsAcl',
  files: 'filesAcl',
  raw: 'rawAcl',
  sequences: 'sequencesAcl',
  timeseries: 'timeSeriesAcl',
  securitycategories: 'securityCategoriesAcl',
  apikeys: 'apikeysAcl',
  groups: 'groupsAcl',
  users: 'usersAcl',
  projects: 'projectsAcl',
  datasets: 'datasetsAcl',
  labels: 'labelsAcl',
  seismic: 'seismicAcl',
  relationships: 'relationshipsAcl',
  entitymatching: 'entitymatchingAcl',
  documentpipelines: 'documentPipelinesAcl',
  filepipelines: 'filePipelinesAcl',
  documentfeedback: 'documentFeedbackAcl',
  annotations: 'annotationsAcl',
  types: 'typesAcl',
  digitaltwin: 'digitalTwinAcl',
  generic: 'genericsAcl',
  pipelines: 'pipelinesAcl',
  modelhosting: 'modelHostingAcl',
  analytics: 'analyticsAcl',
  functions: 'functionsAcl',
  geospatial: 'geospatialAcl',
};

export const getCapabilityName = (capability: string) => {
  let capabilityName;
  if (capability.endsWith('Acl')) {
    capabilityName = `${capability.replace('Acl', '')}`.toLowerCase();
  }
  if (capability.endsWith('_acl')) {
    capabilityName = `${capability.replace('_acl', '')}`.toLowerCase();
  }
  if (capabilityName === 'generics') {
    capabilityName = 'generic';
  }
  if (capabilityName === 'threed') {
    capabilityName = '3d';
  }
  if (Object.keys(nameToAclTypeMap).includes(capability)) {
    capabilityName = capability;
  }
  return capabilityName;
};

export const getActionLabel = (capability: string, action: string) => {
  const capabilityName = getCapabilityName(capability);
  return `${capabilityName}:${action.toLowerCase()}`;
};

export const escapeCSVValue = (value: string) => {
  if (value && String(value)) {
    try {
      return String(value).replace(/"/g, '""');
    } catch (err) {
      throw new Error(err as any);
    }
  }
  return value;
};

// Transformation-list column sorter functions
export function dateSorter(dateA: number = 0, dateB: number = 0) {
  return moment(dateA).diff(dateB);
}

export function stringSorter<T extends Record<string, any>>(
  strA: T,
  strB: T,
  columnKey: keyof T
) {
  const a = strA[columnKey];
  const b = strB[columnKey];
  return a.toLowerCase() < b.toLowerCase()
    ? -1
    : b.toLowerCase() > a.toLowerCase()
    ? 1
    : 0;
}

export const getLocalStorageState = (key: string) => {
  return window.localStorage.getItem(key);
};

export const setLocalStorageState = (key: string, value: string) => {
  window.localStorage.setItem(key, value);
};

export const getPreviewWarnings = (
  preview?: QueryPreviewData,
  schema?: Schema[],
  destination?: Destination
): Warning[] => {
  const list: Warning[] = [];
  if (preview) {
    const missingColumns: Warning[] =
      schema
        ?.filter(({ nullable }) => !nullable)
        .filter(({ name }) => {
          return !preview?.schema.items.find((s) => s.name === name);
        })
        .map(({ name, sqlType }) => ({
          column: name,
          type: 'column-missing',
          sqlType,
        })) ?? [];

    const typeMismatchColumns: Warning[] =
      schema
        ?.filter(({ name, sqlType, type }) => {
          const previewItem = preview?.schema.items.find(
            (s) => s.name === name
          );
          if (previewItem) {
            if (
              typeof previewItem.type === 'string' &&
              typeof type === 'string'
            ) {
              return previewItem.type !== type;
            } else if (
              typeof previewItem.type === 'object' &&
              typeof type === 'object'
            ) {
              return previewItem.type.type !== type.type;
            }
            return previewItem.sqlType !== sqlType;
          }
          return false;
        })
        .map(({ name, sqlType, type: schemaType }) => ({
          column: name,
          type: 'incorrect-type',
          sqlType,
          schemaType,
        })) ?? [];

    const unknownColumns: Warning[] =
      (destination?.type !== 'raw' &&
        preview?.schema.items
          .filter(({ name }) => !schema?.find((s) => s.name === name))
          .map(({ name }) => ({
            column: name,
            type: 'unknown-column',
          }))) ||
      [];
    list.push(
      ...missingColumns.concat(unknownColumns).concat(typeMismatchColumns)
    );
  }
  return list;
};

export type FlattenedDataModel = Omit<DataModel, 'version' | 'views'> & {
  versions: DataModel[];
};

export const flattenFDMModels = (models: DataModel[]): FlattenedDataModel[] => {
  const map: {
    [space: string]: {
      [modelExternalId: string]: { [version: string]: DataModel };
    };
  } = {};

  models.forEach((model) => {
    const { externalId, space, version } = model;
    if (!map[space]) {
      map[space] = {};
    }
    if (!map[space][externalId]) {
      map[space][externalId] = {};
    }
    map[space][externalId][version] = model;
  });

  const arr: FlattenedDataModel[] = [];

  Object.entries(map).forEach(([space, modelMap]) => {
    Object.entries(modelMap).forEach(([modelExternalId, versionMap]) => {
      const firstEntry = Object.values(versionMap)[0];
      const flattenedModel: FlattenedDataModel = {
        externalId: modelExternalId,
        space: space,
        name: firstEntry.name,
        description: firstEntry.description,
        versions: [],
      };
      Object.values(versionMap).forEach((model) => {
        flattenedModel.versions.push(model);
      });
      arr.push(flattenedModel);
    });
  });

  return arr;
};

export const hasCredentials = (transformation: TransformationRead): boolean => {
  const {
    destinationSession,
    hasDestinationApiKey,
    hasDestinationOidcCredentials,
    hasSourceApiKey,
    hasSourceOidcCredentials,
    sourceSession,
  } = transformation;

  const hasApiKey = hasSourceApiKey && hasDestinationApiKey;
  const hasOidcCredentials =
    hasSourceOidcCredentials && hasDestinationOidcCredentials;
  const hasSession = !!sourceSession && !!destinationSession;
  return hasApiKey || hasOidcCredentials || hasSession;
};

export const validateQueryBeforeRun = (
  currentQuery: string,
  preview?: QueryPreviewSuccess,
  schema?: Schema[],
  destination?: Destination
): boolean => {
  if (currentQuery !== preview?.query) {
    return false;
  }

  if (!preview.data?.results || !schema || !destination) {
    return false;
  }

  const warnings = getPreviewWarnings(preview.data, schema, destination);
  return warnings.length === 0;
};
