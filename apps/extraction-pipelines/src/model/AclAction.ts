export interface AclAction {
  acl: string;
  action: string;
}

export const INTEGRATIONS_ACL: 'integrationsAcl' = 'integrationsAcl';
export const DATASETS_ACL: 'datasetsAcl' = 'datasetsAcl';

export const EXTPIPES_ACL_WRITE: Readonly<AclAction> = {
  acl: INTEGRATIONS_ACL,
  action: 'WRITE',
};
export const EXTPIPES_ACL_READ: Readonly<AclAction> = {
  acl: INTEGRATIONS_ACL,
  action: 'READ',
};
export const DATASETS_ACL_READ: Readonly<AclAction> = {
  acl: DATASETS_ACL,
  action: 'READ',
};
