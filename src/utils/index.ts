import axios from 'axios';

type SidecarConfig = {
  appsApiBaseUrl: string;
  applicationId: string;
  appName: string;
  backgroundImage: string;
};

const DEFAULT_SIDECAR: SidecarConfig = {
  appsApiBaseUrl: 'https://localhost',
  applicationId: 'tenant-selector-test',
  appName: 'Tenant Selector Test',
  backgroundImage: '',
};

export const getSidecar = (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (window as any).__cogniteSidecar || DEFAULT_SIDECAR;
};

type ValidationResult = {
  status: number; // HTTP status code
};

export type TenantValidator = (tenant: string) => Promise<ValidationResult>;

export const sanitizeTenant = (tenant: string) =>
  (tenant || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

export const validateTenant: TenantValidator = async (
  tenant: string
): Promise<ValidationResult> => {
  const { applicationId, appsApiBaseUrl } = getSidecar();
  return axios
    .get(`${appsApiBaseUrl}/tenant`, {
      params: {
        app: process.env.REACT_APP_APPLICATION_ID || applicationId,
        tenant,
      },
    })
    .then((response) => {
      return {
        status: response.status,
      };
    })
    .catch(({ response }) => {
      return {
        status: response.status,
      };
    });
};

const KEY_LAST_TENANT = '__tenant-selector_last-tenant';

export const getLastTenant = (): string | undefined => {
  return KEY_LAST_TENANT;
};

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
};
