export interface AclAction {
  acl: string;
  action: string;
}

export const EXTRACTION_PIPELINES_ACL: 'extractionPipelinesAcl' =
  'extractionPipelinesAcl';

const aclAction = (
  acl: string,
  action: 'READ' | 'WRITE' | 'LIST'
): Readonly<AclAction> => ({
  acl,
  action,
});

export const EXTPIPES_READS = [aclAction(EXTRACTION_PIPELINES_ACL, 'READ')];
export const EXTPIPES_WRITES = [aclAction(EXTRACTION_PIPELINES_ACL, 'WRITE')];
