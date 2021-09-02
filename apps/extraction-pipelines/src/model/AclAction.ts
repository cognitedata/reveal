export interface AclAction {
  acl: string;
  action: string;
}

export const INTEGRATIONS_ACL: 'integrationsAcl' = 'integrationsAcl';
export const DATASETS_ACL: 'datasetsAcl' = 'datasetsAcl';
export const EXTRACTION_PIPELINES_ACL: 'extractionPipelinesAcl' =
  'extractionPipelinesAcl';

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
  aclAction(EXTRACTION_PIPELINES_ACL, 'READ'),
];
export const EXTPIPES_WRITES = [
  aclAction(INTEGRATIONS_ACL, 'WRITE'),
  aclAction(EXTRACTION_PIPELINES_ACL, 'WRITE'),
];
