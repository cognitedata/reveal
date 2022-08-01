import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import moment from 'moment';
import { TranslationKeys } from 'common/i18n';
import { updateGroup } from 'utils/updateGroup';
import queryString from 'query-string';
import handleError from 'utils/handleError';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isDate from 'lodash/isDate';
import isObject from 'lodash/isObject';
import { APIDataSet, DataSet } from './types';
import { styleScope } from 'styles/styleScope';

export const stringifyMetaData = (dataSet: { metadata: {} }) => {
  const newDataset = JSON.parse(JSON.stringify(dataSet));
  if (dataSet.metadata) {
    Object.keys(dataSet.metadata).forEach((key) => {
      newDataset.metadata[key] =
        JSON.stringify(newDataset.metadata[key], null, 0) || '';
    });
  }
  return newDataset;
};

/* if a metadata field has been added to a dataSet using the api (e.g., 'key1' : 'hello' )
parsing that with JSON.parse will return an error, this is why this function is needed to check before parsing a field */

const IsJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const parseDataSet = (apiDataSet: APIDataSet): DataSet => {
  const newDataset = JSON.parse(JSON.stringify(apiDataSet));
  const metadata = newDataset.metadata ?? {};
  Object.keys(metadata).forEach((key) => {
    if (IsJsonString(metadata[key] ?? '')) {
      newDataset.metadata[key] = JSON.parse(metadata[key]);
    }
  });
  return newDataset;
};

export const parseDataSetsList = (dataSets: APIDataSet[]): Array<DataSet> => {
  return dataSets.map((apiDataSet) => parseDataSet(apiDataSet));
};

export const getJetfireUrl = () => {
  return `https://${
    getStringCdfEnv() || 'api'
  }.cognitedata.com/api/v1/projects/${sdk.project}/transformations`;
};

const hasDataSetWriteAction = (group: { capabilities: any }) => {
  const dataSetWrite = 'WRITE';
  const { capabilities: cap } = group;
  return cap.some(
    (acl: { datasetsAcl: { actions: string | string[] } }) =>
      'datasetsAcl' in acl && acl.datasetsAcl.actions.includes(dataSetWrite)
  );
};

export const UserCanWrite = (user: { groups: any[] }) => {
  if (user) {
    return user.groups.some((group: any) => hasDataSetWriteAction(group));
  }
  return false;
};

export const isOwnerOfAllDataSets = (group: any) => {
  return (
    group.capabilities &&
    group.capabilities.some((cap: any) => {
      if (cap?.datasetsAcl && cap?.datasetsAcl.actions.includes('OWNER')) {
        return cap?.datasetsAcl.scope.all === {};
      }
      return false;
    })
  );
};

export const isGroupOwnerOfSet = (
  group: { capabilities: any[] },
  dataSetId: any
) => {
  return group.capabilities.some(
    (cap: {
      datasetsAcl: {
        actions: string | string[];
        scope: { idScope: { ids: string | string[] } };
      };
    }) => {
      if (cap.datasetsAcl && cap.datasetsAcl.actions.includes('OWNER')) {
        return (
          cap.datasetsAcl.scope.idScope &&
          cap.datasetsAcl.scope.idScope.ids &&
          cap.datasetsAcl.scope.idScope.ids.includes(String(dataSetId))
        );
      }
      return false;
    }
  );
};

export const removeDataSetIdFromIDsScope = (
  capabilities: any[],
  dataSetId: number
) => {
  const cleanCapabilities = capabilities.filter((cap: any) => {
    if (cap.datasetsAcl && cap.datasetsAcl?.actions?.includes('OWNER')) {
      const tempCap = { ...cap };
      if (!tempCap.datasetsAcl?.scope?.idScope) {
        return true;
      }
      if (tempCap.datasetsAcl?.scope?.idScope?.ids)
        tempCap.datasetsAcl.scope.idScope.ids =
          tempCap.datasetsAcl?.scope?.idScope?.ids.filter(
            (id: string) => String(id) !== String(dataSetId)
          );
      return tempCap?.datasetsAcl?.scope?.idScope?.ids?.length > 0;
    }
    return cap;
  });
  return cleanCapabilities;
};

export const revokeOwnerAccess = (
  groups: any[],
  dataSetId: number,
  _t: (key: TranslationKeys) => string
) => {
  try {
    return Promise.all(
      groups.map(async (group) => {
        if (!isOwnerOfAllDataSets(group)) {
          await updateGroup(
            group.id,
            {
              capabilities: removeDataSetIdFromIDsScope(
                group?.capabilities,
                dataSetId
              ),
            },
            _t
          );
        }
      })
    );
  } catch (e) {
    return handleError({ ...(e as any) });
  }
};

export const makeGroupsOwnerOfSet = (
  groups: any[],
  dataSetId: any,
  _t: (key: TranslationKeys) => string
) => {
  const dataSetsOwnerAcl = {
    datasetsAcl: {
      actions: ['OWNER'],
      scope: {
        idScope: {
          ids: [dataSetId],
        },
      },
    },
  };
  try {
    return Promise.all(
      groups.map(async (group: { id: any; capabilities: any }) => {
        await updateGroup(
          group.id,
          {
            capabilities: [...group.capabilities, dataSetsOwnerAcl],
          },
          _t
        );
      })
    );
  } catch (e) {
    return handleError({ ...(e as any) });
  }
};

export const getAllSetOwnersFromGroups = (dataSetId: any, groups: any[]) => {
  return groups.filter((group: any) => isGroupOwnerOfSet(group, dataSetId));
};

export const getAllSetOwners = async (dataSetId: any) => {
  try {
    const groups = await sdk.groups.list({ all: true });
    return getAllSetOwnersFromGroups(dataSetId, groups);
  } catch (e) {
    handleError({ ...(e as any) });
    return [];
  }
};

export const updateDataSetOwners = async (
  dataSetId: any,
  newOwners: any[],
  _t: (key: TranslationKeys) => string
) => {
  try {
    const oldOwners = await getAllSetOwners(dataSetId);

    const groupsToRevokeAccess = oldOwners.filter(
      (group: { id: any }) =>
        !newOwners.map((g: { id: any }) => g.id).includes(group.id)
    );
    const groupsToGiveAccess = newOwners.filter(
      (group: { id: any }) =>
        !oldOwners.map((g: { id: any }) => g.id).includes(group.id)
    );
    revokeOwnerAccess(groupsToRevokeAccess, dataSetId, _t);
    makeGroupsOwnerOfSet(groupsToGiveAccess, dataSetId, _t);
  } catch (e) {
    handleError({ ...(e as any) });
  }
};

export const formatMetadata = (metadata: { [x: string]: any }) => {
  if (!metadata) return metadata;
  return Object.keys(metadata).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        isObject(metadata[key]) && isDate(metadata[key])
          ? moment(metadata[key]).calendar()
          : metadata[key],
    }),
    {}
  );
};

export const abbreviateNumber = (n: number) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(1)}K`;
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(1)}M`;
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(1)}B`;
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)}T`;
  return 'N/A';
};

export const isCapScopedOnDataSets = (
  cap: { [x: string]: { scope: { datasetScope: { ids: string | string[] } } } },
  dataSetId: any
) => {
  const aclName = Object.keys(cap)[0];
  return (
    cap[aclName] &&
    cap[aclName].scope &&
    cap[aclName].scope.datasetScope &&
    cap[aclName].scope.datasetScope.ids &&
    cap[aclName].scope.datasetScope.ids.length &&
    cap[aclName].scope.datasetScope.ids.includes(String(dataSetId))
  );
};

export const isGroupScopedOnDataSets = (
  group: { capabilities: any[] },
  dataSetId: any
) => {
  return (
    group.capabilities &&
    group.capabilities.some((cap: any) => isCapScopedOnDataSets(cap, dataSetId))
  );
};

export const countServiceAccountsInGroup = (
  groupId: any,
  serviceAccounts: {
    filter: (arg0: (sa: any) => any) => { (): any; new (): any; length: any };
  }
) => {
  return (
    serviceAccounts.filter(
      (sa: { groups: string | any[] }) =>
        sa.groups && sa.groups.includes(groupId)
    ).length || 0
  );
};

export const timeSeriesCounter = (id: any) =>
  sdk.timeseries.aggregate({ filter: { dataSetIds: [{ id }] } });

export const assetsCounter = (id: any) =>
  sdk.assets.aggregate({ filter: { dataSetIds: [{ id }] } });

export const eventsCounter = async (id: any) =>
  sdk.events.aggregate.count({ filter: { dataSetIds: [{ id }] } });

export const sequenceCounter = (id: any) =>
  sdk.sequences.aggregate({ filter: { dataSetIds: [{ id }] } });

export const filesCounter = (id: any) =>
  sdk.files.aggregate({ filter: { dataSetIds: [{ id }] } });

export const isNotNilOrWhitespace = (input: string) =>
  ((input && input.trim().length) || 0) > 0 ?? false;

export const getStringCdfEnv = () => {
  const { env } = queryString.parse(window.location.search);
  if (isArray(env)) {
    return env[0];
  }
  if (isString(env)) {
    return env;
  }
  return undefined;
};

export const wait = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const azureClusters: string[] = [
  'azure-dev',
  'bluefield',
  'bp-northeurope',
  'westeurope-1',
  'az-eastus-1',
];

export const isOidcEnv = () => {
  if (isAizeEnv()) return true;
  const { flow } = getFlow();
  return flow !== 'COGNITE_AUTH';
};

export const isNextRelease = () => {
  return window.location.hostname.includes('next-release');
};

export const isAizeEnv = () => {
  return window.location.hostname.includes('aize');
};

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};

export const nameToAclTypeMap = {
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

export const getCapabilityName = (capability: any) => {
  let capabilityName;
  if (isString(capability)) {
    if (capability.endsWith('Acl')) {
      capabilityName = `${capability.replace('Acl', '')}`.toLowerCase();
    }
    if (capability.endsWith('_acl')) {
      capabilityName = `${capability.replace('_acl', '')}`.toLowerCase();
    }
  } else if (isObject(capability)) {
    const acl = Object.keys(capability)[0];
    capabilityName = `${acl.replace('Acl', '')}`.toLowerCase();
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

export const getActionLabel = (capability: any, action: string) => {
  const capabilityName = getCapabilityName(capability);
  return `${capabilityName}:${action.toLowerCase()}`;
};

export const getReadableCapabilities = (capabilities: any[]) =>
  capabilities.reduce((p, cap) => {
    // There's always just one key per object
    const acl = Object.keys(cap)[0];
    const actionLabels = cap[acl].actions.map((action: any) =>
      getActionLabel(cap, action)
    );
    return [...p, ...actionLabels];
  }, []);
