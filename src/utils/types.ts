export type Flow = 'AAD_OAUTH' | 'ADFS_OAUTH' | 'CDF_OAUTH';
export interface AccessPermission {
  acl: string;
  actions: string[];
  scope?: { type: string; value: string };
}
export interface User {
  project?: string;
  projectId?: number;
  user?: string;
  groups?: Group[];
  actions?: any;
}

export interface Group {
  id: number;
  isDeleted: boolean;
  deletedTime: Date;
  name?: string;
  capabilities: any[];
}
