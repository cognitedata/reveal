export interface AclAction {
  acl: string;
  action: string;
}

export const INTEGRATIONS_ACL: 'integrationsAcl' = 'integrationsAcl';
export const DATASETS_ACL: 'datasetsAcl' = 'datasetsAcl';
export const EXTPIPES_ACL: 'extpipesAcl' = 'extpipesAcl';

const aclAction = (
  acl: string,
  action: 'READ' | 'WRITE'
): Readonly<AclAction> => ({
  acl,
  action,
});

export const EXTPIPES_READS = [
  aclAction(DATASETS_ACL, 'READ'),
  aclAction(INTEGRATIONS_ACL, 'READ'),
  aclAction(EXTPIPES_ACL, 'READ'),
];
export const EXTPIPES_WRITES = [
  aclAction(INTEGRATIONS_ACL, 'WRITE'),
  aclAction(EXTPIPES_ACL, 'WRITE'),
];
