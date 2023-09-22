export type IdpVendor = 'AZURE_AD' | 'AUTH0' | 'GOOGLE';

export interface PublicOrgResponse {
  id: string;
  vendor: IdpVendor;
  migrationStatus: 'NOT_STARTED' | 'DUAL_LOGIN' | 'EXCLUSIVE_LOGIN';
}

export type CogIdpError = {
  error: {
    code: number;
    message: string;
  };
};

export interface ListCogIdpProjectsResponse {
  items: CogIdpProject[];
}

export interface CogIdpProject {
  name: string;
  apiUrl: string;
}
