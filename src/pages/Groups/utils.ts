import { cognite } from '@cognite/acl-protos';
import { CogniteCapability } from '@cognite/sdk';

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

const nameToFormattedName = {
  apikeys: 'API Keys',
  securitycategories: 'Security categories',
  '3d': '3D',
  timeseries: 'Time series',
  digitaltwin: 'Digital twin',
  datasets: 'Data sets',
  modelhosting: 'Model hosting',
  entitymatching: 'Entity matching',
  documentpipelines: 'Document pipelines',
  filepipelines: 'File pipelines',
  documentfeedback: 'Document feedback',
  annotations: 'Annotations',
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
      'types',
    ],
  },
  {
    name: 'Protect or blacklist data',
    items: ['datasets', 'securitycategories'],
  },
  {
    name: 'Permissions to access mgmt.',
    items: ['apikeys', 'groups', 'users', 'projects'],
  },
  {
    name: 'Other',
    items: [
      'digitaltwin',
      'modelhosting',
      'generic',
      'functions',
      'labels',
      'geospatial',
      'entitymatching',
      'documentpipelines',
      'filepipelines',
      'documentfeedback',
      'annotations',
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
    'Security categories is a way to blacklist data. Data with a security category is only visible to users in groups that have explicit access to the specific security category',
  sequences:
    'Sequences is a tabular data representation used for e.g., well trajectories or pump design curves',
  '3d': '3D includes 3D models, 3D model revisions, and 3D files',
  timeseries: 'Time series store data points in time order, e.g., sensor data',
  users: 'Users refer to service accounts',
  relationships:
    'Relationships represent connections between pairs of CDF resources',
  datasets:
    'Data sets are groups of data based on origin, such as all SAP work orders',
  labels:
    'With labels you as an IT manager or data engineer can create a predefined set of managed terms that you can use to annotate and group assets',
  seismic: 'Seismic is a representation of cubes of seismic traces',
  types:
    'Types store defined schemas, e.g. a schema for what data should be defined for a valve',
  digitaltwin:
    'Digital twin is a representation of a 3D world used in a digital twin application',
  modelhosting: 'Model hosting lets you deploy and schedule models',
  entitymatching: 'Match resources to their corresponding entity',
  annotations: 'Edit annotations in documents',
};

export const getActionsFromCapability = (capability: CogniteCapability) => {
  const aclType = Object.keys(capability)[0];
  // @ts-ignore
  return capability[aclType].actions;
};

export const getScopeFromCapability = (capability: CogniteCapability) => {
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

export const getAclType = (capability: CogniteCapability) => {
  const capabilityName = getCapabilityName(capability);
  // @ts-ignore
  return nameToAclTypeMap[capabilityName];
};

const getCapabilityKey = (capability: CogniteCapability) => {
  let capabilityKey;
  let capabilityName = getCapabilityName(capability);
  if (capabilityName === '3d') {
    capabilityName = 'threed';
  }
  if (capabilityName) {
    capabilityKey = `${capabilityName}_acl`;
  }
  return capabilityKey;
};

export const getCapabilityFormattedName = (capability: CogniteCapability) => {
  const capabilityName = getCapabilityName(capability) || capability;
  // @ts-ignore
  return nameToFormattedName[capabilityName] || capitalize(capabilityName);
};

export const getCapabilityTypeGroups = () => {
  const filteredGroups = capabilityTypeGroups.map(group => {
    const filteredItems = group.items.filter(item => !!getCapabilityName(item));
    return { ...group, items: filteredItems };
  });
  return filteredGroups.filter(group => group.items.length > 0);
};

export const getCapabilityDescription = (capability: CogniteCapability) => {
  const capabilityName = getCapabilityName(capability);
  // @ts-ignore
  return capabilityDescriptions[capabilityName] || '';
};

const SCOPE_LABELS = {
  all: 'All',
  currentuserscope: 'Current user',
  assetIdScope: 'Assets',
  idscope: {
    timeseries: 'Time series',
    securitycategories: 'Security categories',
  },
  assetRootIdScope: 'Root assets',
  tableScope: 'Tables',
  datasetScope: 'Data sets',
  idScope: 'Data sets',
  partition: 'Partition',
};

export const getScopeLabel = (scope: string, capability: CogniteCapability) => {
  if (scope === 'idscope') {
    // @ts-ignore
    return SCOPE_LABELS[scope][getCapabilityName(capability)];
  }
  // @ts-ignore
  return SCOPE_LABELS[scope];
};

// export const getActionLabel = (capability, action) => {
//   const capabilityName = getCapabilityName(capability);
//   return `${capabilityName}:${action.toLowerCase()}`;
// };

// export const getReadableCapabilities = capabilities =>
//   capabilities.reduce((p, cap) => {
//     // There's always just one key per object
//     const acl = Object.keys(cap)[0];
//     const actionLabels = cap[acl].actions.map(action =>
//       getActionLabel(cap, action)
//     );
//     return [...p, ...actionLabels];
//   }, []);

// const getScope = capability => {
//   const acl = Object.keys(capability)[0];
//   const scope = Object.keys(capability[acl].scope)[0];

//   if (scope && scope !== 'all') {
//     return scope;
//   }
//   return null;
// };

export const getCapabilityActions = (capability: CogniteCapability) => {
  const capabilityKey = getCapabilityKey(capability);
  // @ts-ignore
  const acl = capabilityKey && cognite[capabilityKey];
  if (acl) {
    let actions = Object.keys(acl.Action);
    if (capabilityKey === 'projects_acl') {
      actions = actions.filter(
        action => action !== 'CREATE' && action !== 'DELETE'
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
    case 'files':
    case 'assets':
    case 'events':
    case 'sequences':
    case 'relationships':
      return ['datasetScope', 'all'];
    case 'datasets':
      return ['idScope', 'all']; // idScope (uppercase S) and ...
    case 'securitycategories':
      return ['idscope', 'all']; // ... idscope (lowercase s) are different
    case 'seismic':
      return ['partition', 'all'];
    default:
      return ['all'];
  }
};

// const getScopeTag = (scope, capabilities, action) => {
//   return <ScopeTag scope={scope} capabilities={capabilities} action={action} />;
// };

// export const getReadableCapabilitiesWithScope = capabilities =>
//   capabilities
//     .reduce((p, cap, index) => {
//       const acl = Object.keys(cap)[0];
//       const scope = getScope(cap);
//       const actionLabels = cap[acl].actions.map(action => {
//         const capabilityText = getActionLabel(cap, action);
//         const uniqueKey = `${capabilityText}-${index}`;
//         return {
//           key: uniqueKey,
//           label: (
//             <span>
//               {scope && getScopeTag(scope, cap, action.toLowerCase())}
//               {capabilityText}
//             </span>
//           ),
//         };
//       });
//       return [...p, ...actionLabels];
//     }, [])
//     .sort((a, b) => stringCompare(a.key, b.key));

// const userHasCapability = (user, aclType, actions, scope = null) =>
//   actions.every(action =>
//     user.groups.some(group =>
//       group.capabilities.some(
//         capability =>
//           aclType in capability &&
//           capability[aclType].actions != null &&
//           capability[aclType].actions.includes(action) &&
//           (scope == null ||
//             'all' in capability[aclType].scope ||
//             scope in capability[aclType].scope)
//       )
//     )
//   );

// export const userHasAdminAcls = user =>
//   userHasCapability(
//     user,
//     'groupsAcl',
//     ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
//     'all'
//   );

// export const userHasProjectAdminAcls = user =>
//   userHasCapability(user, 'projectsAcl', ['READ', 'UPDATE'], 'all');

// export const userHasReadIAM = user =>
//   userHasCapability(user, 'usersAcl', ['READ', 'LIST'], 'all') &&
//   userHasCapability(user, 'apikeysAcl', ['READ', 'LIST'], 'all') &&
//   userHasCapability(user, 'groupsAcl', ['READ', 'LIST'], 'all');

// export const userHasProjectUpdateAcl = user =>
//   userHasCapability(user, 'projectsAcl', ['UPDATE']);

// export const columnFilterIcon = filtered => (
//   <FilterWrapper
//     filtered={filtered}
//     style={{
//       position: 'relative',
//       width: 'auto',
//       padding: '0',
//       marginLeft: '16px',
//     }}
//   >
//     <Button
//       icon="Filter"
//       iconPlacement="right"
//       style={{ color: filtered ? theme.actionText : 'black' }}
//     >
//       Filter
//     </Button>
//   </FilterWrapper>
// );

// export const columnWithFilterTitle = columnTitle => (
//   <span style={{ lineHeight: '32px' }}>{columnTitle}</span>
// );
