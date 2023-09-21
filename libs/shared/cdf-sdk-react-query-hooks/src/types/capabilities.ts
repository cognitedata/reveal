export type Capability = {
  acl: string;
  actions: string[];
  scope: any;
  projectScope?: { projects: string[] };
};
