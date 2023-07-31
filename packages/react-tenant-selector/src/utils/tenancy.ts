import axios from 'axios';

type ValidationResult = {
  status: number; // HTTP status code
};

export type TenantValidator = (
  tenant: string,
  applicationId: string,
  appsApiBaseUrl: string
) => Promise<ValidationResult>;

export const sanitizeTenant = (tenant: string) =>
  (tenant || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

export const validateTenant: TenantValidator = async (
  tenant,
  applicationId,
  appsApiBaseUrl
): Promise<ValidationResult> =>
  axios
    .get(`${appsApiBaseUrl}/tenant`, {
      params: {
        app: process.env.REACT_APP_APPLICATION_ID || applicationId,
        tenant,
      },
    })
    .then((response) => ({
      status: response.status,
    }))
    .catch(({ response }) => ({
      status: response.status,
    }));

const KEY_LAST_TENANT = '__tenant-selector_last-tenant';

export const getLastTenant = (): string | undefined => KEY_LAST_TENANT;

type ErrorSchema = {
  [name: string]: {
    requiredMessage: string;
    validationMessage: string;
  };
};

export const errorSchema: ErrorSchema = {
  tenant: {
    requiredMessage: 'Company ID is required',
    validationMessage: 'This is an unknown configuration',
  },
  cluster: {
    requiredMessage: '',
    validationMessage: 'This is an unknown configuration',
  },
};
