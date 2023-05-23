export interface Project {
  projectUrlName: string;
  groups: number[];
}

export interface TokenInspect {
  capabilities: any[];
  projects: Project[];
}

export interface ProjectList {
  items: { urlName: string }[];
}
