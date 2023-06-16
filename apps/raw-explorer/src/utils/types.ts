export interface AccessPermission {
  acl: string;
  actions: string[];
  scope?: { type: string; value: string };
}

export type Flow = 'AAD_OAUTH' | 'ADFS_OAUTH' | 'CDF_OAUTH';
