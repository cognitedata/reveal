import handleError from './handleError';
import { styleScope } from './styleScope';

export { styleScope } from './styleScope';

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

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};

export const cleanUrl = (database: string, table: string) => {
  return `${encodeURIComponent(database)}/${encodeURIComponent(table)}`;
};

export const escapeCSVValue = (value: string) => {
  if (value && String(value)) {
    try {
      return String(value).replace(/"/g, '""');
    } catch (err) {
      handleError({ ...err, sendToSentry: false });
    }
  }
  return value;
};

export const toLocalDate = (time: Date) => {
  return new Date(time).toLocaleDateString();
};

export const toLocalTime = (time: Date) => {
  return new Date(time).toLocaleTimeString();
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

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
};
