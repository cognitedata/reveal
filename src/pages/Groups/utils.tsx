import { cognite } from '@cognite/acl-protos';
import {
  AclGroups,
  CogniteCapability,
  Group,
  SingleCogniteCapability,
} from '@cognite/sdk';
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

// TODO CDFUX-1572 - figure out translation
const nameToFormattedName = {
  apikeys: 'API Keys',
  securitycategories: 'Security categories',
  '3d': '3D',
  timeseries: 'Time series',
  digitaltwin: 'Digital twin',
  datasets: 'Data sets',
  transformations: 'Transformations',
  extractionpipelines: 'Extraction pipelines',
  extractionruns: 'Extraction pipeline runs',
  entitymatching: 'Entity matching',
  documentpipelines: 'Document pipelines',
  filepipelines: 'File pipelines',
  documentfeedback: 'Document feedback',
  annotations: 'Annotations',
  robotics: 'Robotics',
  sessions: 'Sessions',
  templategroups: 'Template groups',
  templateinstances: 'Template instances',
  visionmodel: 'Vision model',
};

const capabilityTypeGroups = [
  {
    name: 'Data',
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
    name: 'Protect or denylist data',
    items: ['datasets', 'securitycategories'],
  },
  {
    name: 'Permissions to access management.',
    items: ['apikeys', 'groups', 'users', 'projects', 'sessions'],
  },
  {
    name: 'Other',
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

export const capabilityDescriptions = {
  assets:
    'Assets represent objects or groups of objects, such as physical equipment or systems',
  apikeys: 'API keys let services authenticate towards CDF',
  events:
    'Events store information that happen over a period of time, such as maintenance logs',
  files: 'Files include documents such as P&IDs, logic diagrams, images, etc.',
  groups:
    'Groups store which permissions different users should have access to',
  projects:
    'Project is used to configure which Identity Provider CDF uses to authenticate users against',
  raw: 'RAW is a tabular store that serves as a staging area for data in CDF',
  securitycategories:
    'Security categories is a way to denylist data. Data with a security category is only visible to users in groups that have explicit access to the specific security category',
  sequences:
    'Sequences is a tabular data representation used for e.g., well trajectories or pump design curves',
  '3d': '3D includes 3D models, 3D model revisions, and 3D files',
  timeseries: 'Time series store data points in time order, e.g., sensor data',
  users: 'Users refer to service accounts',
  relationships:
    'Relationships represent connections between pairs of CDF resources',
  datasets:
    'Data sets are groups of data based on origin, such as all SAP work orders',
  transformations:
    'Transformations are used to transform data from RAW tables and write it to CDF resources or write back to RAW tables',
  extractionpipelines:
    'Extraction pipelines are used to extract data from a source system',
  extractionruns: 'Execution history for extraction pipelines',
  labels:
    'With labels you as an IT manager or data engineer can create a predefined set of managed terms that you can use to annotate and group assets',
  seismic: 'Seismic is a representation of cubes of seismic traces',
  digitaltwin:
    'Digital twin is a representation of a 3D world used in a digital twin application',
  entitymatching: 'Match resources to their corresponding entity',
  annotations: 'Edit annotations in documents',
  robotics: 'Control robots and access robotics data',
  sessions:
    'Sessions are used to maintain access to CDF resources for an extended period of time beyond the initial access granted to an internal service.',
  templategroups: 'Organize and structure your data',
  templateinstances: 'Access data organized in templategroups',
  wells: 'Access Well Data Layer',
  visionmodel:
    'Computer vision models are used to analyze and extract information from imagery data.',
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
  // @ts-ignore
  return nameToFormattedName[capabilityName] || capitalize(capabilityName);
};

export const getCapabilityTypeGroups = () => {
  const filteredGroups = capabilityTypeGroups.map((group) => {
    const filteredItems = group.items.filter(
      (item) => !!getCapabilityName(item)
    );
    return { ...group, items: filteredItems };
  });
  return filteredGroups.filter((group) => group.items.length > 0);
};

export const getCapabilityDescription = (
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  const capabilityName = getCapabilityName(capability);
  // @ts-ignore
  return capabilityDescriptions[capabilityName] || '';
};

export const getScopeLabel = (
  scope: string,
  capability: CogniteCapability | string | SingleCogniteCapability
) => {
  switch (scope) {
    case 'all':
      return 'All';
    case 'currentuserscope':
      return 'Current user';
    case 'assetIdScope':
      return 'Assets';
    case 'assetRootIdScope':
      return 'Root assets';
    case 'tableScope':
      return 'Tables';
    case 'datasetScope':
      return 'Data sets';
    case 'idScope':
      switch (getCapabilityName(capability)) {
        case 'extractionpipelines':
          return 'Extraction pipelines';
        default:
          return 'Data sets';
      }
    case 'extractionPipelineScope':
      return 'Extraction pipelines';
    case 'partition':
      return 'Partition';
    case 'idscope':
      switch (getCapabilityName(capability)) {
        case 'timeseries':
          return 'Time series';
        case 'securitycategories':
          return 'Security categories';
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
