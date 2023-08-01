import type { AclName } from '@simint-app/hooks/useCheckAcl';

export const AUTOCLOSE_PERIOD = 7500;

export const ROUGH_APPROXIMATION = 'Rough Approximation';

export const PERMISSIONS_REQUIRED_PAGE_PATH = '/simint/need-permissions';

export const BASIC_CAPABILITIES_REQUIRED = [
  { acl: 'eventsAcl' as AclName, actions: ['READ', 'WRITE'] },
  { acl: 'filesAcl' as AclName, actions: ['READ', 'WRITE'] },
  { acl: 'sequencesAcl' as AclName, actions: ['READ', 'WRITE'] },
  { acl: 'timeSeriesAcl' as AclName, actions: ['READ', 'WRITE'] },
  { acl: 'datasetsAcl' as AclName, actions: ['READ'] },
  { acl: 'projectsAcl' as AclName, actions: ['READ', 'LIST'] },
  { acl: 'groupsAcl' as AclName, actions: ['READ', 'LIST'] },
  { acl: 'labelsAcl' as AclName, actions: ['READ', 'WRITE'] },
  { acl: 'rawAcl' as AclName, actions: ['READ', 'WRITE', 'LIST'] },
];
