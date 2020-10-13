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

export interface ShouldRenderData {
  user: User;
  environment: string;
}

export type IsAuthorizedFunction = (user: User) => boolean;
export type ShouldRenderFunction = (data: ShouldRenderData) => boolean;

// subApp's subpage
export interface SubPageProps {
  name: string;
  path: string;
  icon?: string;
  showInMenu: boolean;
  isAuthorized?: IsAuthorizedFunction;
  shouldRender?: ShouldRenderFunction;
  component: React.JSXElementConstructor<any>;
}

// subSection definition
export interface SubSectionProps {
  subtitle: string;
  subApps: string[];
}

// section definition
export interface SectionProps {
  name: string;
  path: string;
  colors: { primary: string; secondary: string };
  landingPage: React.JSXElementConstructor<any>;
  shouldRender: ShouldRenderFunction;
  subSections: SubSectionProps[];
  description: string;
}
