export type IdpVendor = 'AZURE_AD' | 'AUTH0' | 'GOOGLE';

export interface PublicOrgResponse {
  id: string;
  vendor: IdpVendor;
}

export type PublicOrgError = {
  error: {
    code: number;
    message: string;
  };
};
