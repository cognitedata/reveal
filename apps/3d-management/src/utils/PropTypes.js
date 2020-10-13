import PropTypes from 'prop-types';

// subApp's subpage
export const subpagePropType = PropTypes.shape({
  name: PropTypes.string,
  icon: PropTypes.string,
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  shouldRender: PropTypes.func,
  isAuthorized: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  showInMenu: PropTypes.bool,
});

// subApp definition
export const appPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  shouldRender: PropTypes.func,
  isAuthorized: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  subpages: PropTypes.arrayOf(subpagePropType),
  store: PropTypes.object,
});

// subSection definition
export const subSectionPropType = PropTypes.shape({
  subtitle: PropTypes.string.isRequired,
  subApps: PropTypes.arrayOf(PropTypes.string).isRequired,
});

// section definition
export const sectionPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  landingPage: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  shouldRender: PropTypes.func.isRequired,
  subSections: PropTypes.arrayOf(subSectionPropType).isRequired,
});

// group
export const groupPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
});

// user
export const userPropType = PropTypes.shape({
  project: PropTypes.string.isRequired,
  projectId: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  groups: PropTypes.arrayOf(groupPropType),
});

export const permissionsPropType = PropTypes.shape({
  accessTypes: PropTypes.arrayOf(PropTypes.string),
});

export const groupsPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  isDeleted: PropTypes.bool.isRequired,
  deletedTime: PropTypes.instanceOf(Date),
  name: PropTypes.string.isRequired,
  permissions: permissionsPropType,
  capabilities: PropTypes.array.isRequired,
});

// data set
export const dataSetPropType = PropTypes.shape({
  dataType: PropTypes.string,
  extractorIds: PropTypes.arrayOf(PropTypes.string),
  ownerEmail: PropTypes.string,
  ownerName: PropTypes.string,
  rootAssets: PropTypes.arrayOf(PropTypes.string),
  resourceType: PropTypes.string,
  description: PropTypes.string,
});

export const extractorPropType = PropTypes.shape({
  name: PropTypes.string,
  description: PropTypes.string,
  username: PropTypes.string,
  type: PropTypes.string,
  source: PropTypes.string,
  hostServer: PropTypes.string,
  sourceUsers: PropTypes.arrayOf(PropTypes.string),
  frequency: PropTypes.string,
  frequencyNote: PropTypes.string,
  rawTables: PropTypes.arrayOf(PropTypes.string),
  active: PropTypes.bool,
  toRaw: PropTypes.bool,
  documentationLink: PropTypes.string,
  ownerName: PropTypes.string,
  ownerEmail: PropTypes.string,
});

export const antFormPropType = PropTypes.shape({
  getFieldValue: PropTypes.func,
  setFieldsValue: PropTypes.func,
  validateFields: PropTypes.func,
  getFieldDecorator: PropTypes.func,
});

export const historyPropType = PropTypes.shape({
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    split: PropTypes.func,
  }),
});

export const extractionPropType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  extendedDescription: PropTypes.string,
  qualityAssessment: PropTypes.string,
  status: PropTypes.oneOf(['active', 'inactive', 'warning']),
  schedule: PropTypes.string,
  resourceType: PropTypes.arrayOf(
    PropTypes.oneOf([
      'Time series',
      'Events',
      'Assets',
      'Sequences',
      'Files',
      '3D',
    ])
  ),
  sourceSystem: PropTypes.string,
  sourceConnectionDetails: PropTypes.string,
  targetTables: PropTypes.arrayOf(PropTypes.string),
  cleanQueries: PropTypes.arrayOf(PropTypes.string),
  tool: PropTypes.string,
  toolEnvironment: PropTypes.string,
  toolConfigLink: PropTypes.string,
  apiKeyUsername: PropTypes.string,
  transformationDetails: PropTypes.string,
  rootAssets: PropTypes.arrayOf(PropTypes.string),
  sourceContacts: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, email: PropTypes.string })
  ),
  cdpContacts: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, email: PropTypes.string })
  ),
  documentationLinks: PropTypes.arrayOf(
    PropTypes.shape({ description: PropTypes.string, url: PropTypes.string })
  ),
  comments: PropTypes.string,
});
