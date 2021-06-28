export interface AclAction {
  acl: string;
  action: string;
}

export const EXTPIPES_ACL_WRITE: Readonly<AclAction> = {
  acl: 'integrationsAcl',
  action: 'WRITE',
};
export const EXTPIPES_ACL_READ: Readonly<AclAction> = {
  acl: 'integrationsAcl',
  action: 'READ',
};
