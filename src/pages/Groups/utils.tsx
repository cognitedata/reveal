import { cognite } from '@cognite/acl-protos';
import {
  AclGroups,
  CogniteCapability,
  Group,
  SingleCogniteCapability,
} from '@cognite/sdk';
import { TranslationKeys } from 'common/i18n';
import queryString from 'query-string';

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/*
 * The following map is based on the document available in
 * https://docs.google.com/spreadsheets/d/14SCNGbxHoi-1vTOmL92dZ3GhkxI5rgwgv0FfPKpyzJo/edit#gid=0
 * It is used to filter capabilities to be shown in the production environment
 */
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
  transformations: 'transformationsAcl',
  extractionpipelines: 'extractionPipelinesAcl',
  extractionruns: 'extractionRunsAcl',
  labels: 'labelsAcl',
  seismic: 'seismicAcl',
  relationships: 'relationshipsAcl',
  entitymatching: 'entitymatchingAcl',
  documentpipelines: 'documentPipelinesAcl',
  filepipelines: 'filePipelinesAcl',
  documentfeedback: 'documentFeedbackAcl',
  annotations: 'annotationsAcl',
  digitaltwin: 'digitalTwinAcl',
  pipelines: 'pipelinesAcl',
  analytics: 'analyticsAcl',
  functions: 'functionsAcl',
  geospatial: 'geospatialAcl',
  robotics: 'roboticsAcl',
  sessions: 'sessionsAcl',
  templategroups: 'templateGroupsAcl',
  templateinstances: 'templateInstancesAcl',
  visionmodel: 'visionModelAcl',
  wells: 'wellsAcl',
};

const getCapabilityNameTranslationKey = {
  apikeys: 'api-keys',
  securitycategories: 'security-categories',
  '3d': '3d',
  timeseries: 'time-series',
  digitaltwin: 'digital-twin',
  datasets: 'data-sets',
  transformations: 'transformations',
  extractionpipelines: 'extraction-pipelines',
  extractionruns: 'extraction-runs',
  entitymatching: 'entity-matching',
  documentpipelines: 'document-pipelines',
  filepipelines: 'file-pipelines',
  documentfeedback: 'document-feedback',
  annotations: 'annotations',
  robotics: 'robotics',
  sessions: 'sessions',
  templategroups: 'template-groups',
  templateinstances: 'template-instances',
  visionmodel: 'vision-model',
};

const prepareCapabilityTypeGroups = (_t: (key: TranslationKeys) => string) => {
  const capabilityTypeGroups = [
    {
      name: _t('data'),
      items: [
        '3d',
        'assets',
        'events',
        'files',
        'raw',
        'relationships',
        'seismic',
        'sequences',
        'timeseries',
        'templategroups',
        'templateinstances',
      ],
    },
    {
      name: _t('protect-or-denylist-data'),
      items: ['datasets', 'securitycategories'],
    },
    {
      name: _t('permission-to-access-management'),
      items: ['apikeys', 'groups', 'users', 'projects', 'sessions'],
    },
    {
      name: _t('other'),
      items: [
        'extractionpipelines',
        'extractionruns',
        'digitaltwin',
        'functions',
        'transformations',
        'labels',
        'geospatial',
        'entitymatching',
        'documentpipelines',
        'filepipelines',
        'documentfeedback',
        'annotations',
        'wells',
        'visionmodel',
        'robotics',
      ],
    },
  ];
  return { capabilityTypeGroups };
};

export const capabilityDescriptions = {
  assets: 'capability-desc-assets',
  apikeys: 'capability-desc-apikeys',
  events: 'capability-desc-events',
  files: 'capability-desc-files',
  groups: 'capability-desc-groups',
  projects: 'capability-desc-projects',
  raw: 'RAW is a tabular store that serves as a staging area for data in CDF',
  securitycategories: 'capability-desc-securitycategories',
  sequences: 'capability-desc-sequences',
  '3d': 'capability-desc-3d',
  timeseries: 'capability-desc-timeseries',
  users: 'capability-desc-users',
  relationships: 'capability-desc-relationships',
  datasets: 'capability-desc-datasets',
  transformations: 'capability-desc-transformations',
  extractionpipelines: 'capability-desc-extractionpipelines',
  extractionruns: 'capability-desc-extractionruns',
  labels: 'capability-desc-labels',
  seismic: 'capability-desc-seismic',
  digitaltwin: 'capability-desc-digitaltwin',
  entitymatching: 'capability-desc-entitymatching',
  annotations: 'capability-desc-annotations',
  robotics: 'capability-desc-robotics',
  sessions: 'capability-desc-sessions',
  templategroups: 'capability-desc-templategroups',
  templateinstances: 'capability-desc-templateinstances',
  wells: 'capability-desc-wells',
  visionmodel: 'capability-desc-visionmodel',
};

const deprecatedAclTypes = ['genericsAcl', 'modelHostingAcl', 'typesAcl'];

export const getActionsFromCapability = (
  capability: CogniteCapability | SingleCogniteCapability
) => {
  const aclType = Object.keys(capability)[0];
  // @ts-ignore
  return capability[aclType].actions;
};

export const getScopeFromCapability = (
  capability: CogniteCapability | SingleCogniteCapability
) => {
  const aclType = Object.keys(capability)[0];
  // @ts-ignore
  return capability[aclType].scope;
};

export const getCapabilityName = (capability: any): string => {
  let capabilityName;
  if (typeof capability === 'string') {
    if (capability.endsWith('Acl')) {
      capabilityName = `${capability.replace('Acl', '')}`.toLowerCase();
    }
    if (capability.endsWith('_acl')) {
      capabilityName = `${capability.replace('_acl', '')}`.toLowerCase();
    }
  } else if (typeof capability === 'object') {
    const acl = Object.keys(capability)[0];
    capabilityName = `${acl.replace('Acl', '')}`.toLowerCase();
  }
  if (capabilityName === 'threed') {
    capabilityName = '3d';
  }
  if (Object.keys(nameToAclTypeMap).includes(capability)) {
    capabilityName = capability;
  }
  return capabilityName;
};

export const getAclType = (
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  const capabilityName = getCapabilityName(capability);
  // @ts-ignore
  return nameToAclTypeMap[capabilityName];
};

const getCapabilityKey = (
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  let capabilityKey;
  let capabilityName = getCapabilityName(capability);
  if (capabilityName === '3d') {
    capabilityName = 'threed';
  }
  if (capabilityName === 'templategroups') {
    capabilityName = 'template_groups';
  }
  if (capabilityName === 'templateinstances') {
    capabilityName = 'template_instances';
  }
  if (capabilityName === 'visionmodel') {
    capabilityName = 'vision_model';
  }
  if (capabilityName) {
    capabilityKey = `${capabilityName}_acl`;
  }
  return capabilityKey;
};

export const getCapabilityFormattedName = (
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  const capabilityName = getCapabilityName(capability) || capability;
  const capabilityTranslateKey =
    // @ts-ignore
    getCapabilityNameTranslationKey[capabilityName];

  return {
    // @ts-ignore
    capability: capabilityTranslateKey || capitalize(capabilityName),
    requireTranslate: Boolean(capabilityTranslateKey),
  };
};

export const getCapabilityTypeGroups = (
  _t: (key: TranslationKeys) => string
) => {
  const { capabilityTypeGroups } = prepareCapabilityTypeGroups(_t);
  const filteredGroups = capabilityTypeGroups.map((group) => {
    const filteredItems = group.items.filter(
      (item) => !!getCapabilityName(item)
    );
    return { ...group, items: filteredItems };
  });
  return filteredGroups.filter((group) => group.items.length > 0);
};

export const getCapabilityDescription = (
  capability: CogniteCapability | string | SingleCogniteCapability,
  _t: (key: TranslationKeys) => string
) => {
  const capabilityName = getCapabilityName(capability);
  // @ts-ignore
  const capabilityDescKey = capabilityDescriptions[capabilityName];

  return _t(capabilityDescKey) || '';
};

export const getScopeLabel = (
  scope: string,
  capability: CogniteCapability | string | SingleCogniteCapability,
  _t: (key: TranslationKeys) => string
) => {
  switch (scope) {
    case 'all':
      return _t('all');
    case 'currentuserscope':
      return _t('current-user');
    case 'assetIdScope':
      return _t('assets');
    case 'assetRootIdScope':
      return _t('root-assets');
    case 'tableScope':
      return _t('tables');
    case 'datasetScope':
      return _t('data-sets');
    case 'idScope':
      switch (getCapabilityName(capability)) {
        case 'extractionpipelines':
          return _t('extraction-pipelines');
        default:
          return _t('data-sets');
      }
    case 'extractionPipelineScope':
      return _t('extraction-pipelines');
    case 'partition':
      return _t('partition');
    case 'idscope':
      switch (getCapabilityName(capability)) {
        case 'timeseries':
          return _t('time-series');
        case 'securitycategories':
          return _t('security-categories');
      }
  }
  return null;
};

export const getStringCdfEnv = () => {
  const { env } = queryString.parse(window.location.search);
  if (env instanceof Array) {
    return env[0];
  }
  if (typeof env === 'string') {
    return env;
  }
  return undefined;
};

export const getActionLabel = (
  capability: SingleCogniteCapability | string,
  action: string
) => {
  const capabilityName = getCapabilityName(capability);
  return `${capabilityName}:${action.toLowerCase()}`;
};

export const getCapabilityActions = (
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  const capabilityKey = getCapabilityKey(capability);
  // @ts-ignore
  const acl = capabilityKey && cognite[capabilityKey];
  if (acl) {
    let actions = Object.keys(acl.Action);
    if (capabilityKey === 'projects_acl') {
      actions = actions.filter(
        (action) => action !== 'CREATE' && action !== 'DELETE'
      );
    }
    return actions;
  }
  return [];
};

export const getCapabilityScopes = (
  capability: CogniteCapability | string | undefined
) => {
  const capabilityName = getCapabilityName(capability);
  switch (capabilityName) {
    case 'timeseries':
      return ['datasetScope', 'idscope', 'assetRootIdScope', 'all'];
    case 'groups':
    case 'users':
    case 'apikeys':
      return ['currentuserscope', 'all'];
    case 'raw':
      return ['tableScope', 'all'];
    case '3d':
    case 'files':
    case 'assets':
    case 'events':
    case 'sequences':
    case 'relationships':
    case 'robotics':
    case 'templategroups':
    case 'templateinstances':
      return ['datasetScope', 'all'];
    case 'datasets':
      return ['idScope', 'all']; // idScope (uppercase S) and ...
    case 'transformations':
      return ['datasetScope', 'all'];
    case 'extractionpipelines':
      return ['datasetScope', 'idScope', 'all'];
    case 'extractionruns':
      return ['datasetScope', 'extractionPipelineScope', 'all'];
    case 'securitycategories':
      return ['idscope', 'all']; // ... idscope (lowercase s) are different
    case 'seismic':
      return ['partition', 'all'];
    case 'labels': {
      return ['datasetScope', 'all'];
    }
    default:
      return ['all'];
  }
};

export const stringContains = (
  value?: string,
  searchText?: string
): boolean => {
  if (!searchText) {
    return true;
  }
  try {
    return !!(
      value && value.trim().toUpperCase().search(searchText.toUpperCase()) >= 0
    );
  } catch (e) {
    // Error here means invalid character was used
    return false;
  }
};

export const hasAnyValidGroupForOIDC = (groups?: Group[]): boolean => {
  return Boolean(
    groups?.some(
      ({ capabilities, sourceId }) =>
        sourceId &&
        capabilities?.some((capability) => {
          const { groupsAcl } = capability as { groupsAcl?: AclGroups };
          return groupsAcl?.actions.includes('CREATE');
        })
    )
  );
};

export const isDeprecated = (capability: SingleCogniteCapability): boolean => {
  const capabilityName: string = Object.keys(capability)[0];
  return !deprecatedAclTypes.includes(capabilityName);
};
