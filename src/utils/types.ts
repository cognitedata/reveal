export interface AccessPermission {
  acl: string;
  actions: string[];
  scope?: { type: string; value: string };
}
