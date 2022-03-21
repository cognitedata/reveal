export type Clusters = {
  label: string;
  options: Cluster[];
}[];

export type Cluster = {
  value: string;
  label: string;
  legacyAuth?: boolean;
  disableAad?: boolean;
};

export type LoginParams = {
  clientId: string;
  cluster: string | undefined;
  directory?: string | undefined;
  prompt?: 'select_account' | 'none';
};

type Project = {
  projectUrlName: string;
  groups: number[];
};

type ACL = {
  version: number;
  actions: string[];
  scope: Record<string, any>;
  projectScope: {
    projects: string[];
  };
};
type Cabability = Record<string, ACL>;

export type TokenInspect = {
  subject: string;
  projects: Project[];
  cababilites: Cabability[];
};
