import axios from 'axios';

type SidecarConfig = {
  appsApiBaseUrl: string;
  applicationId: string;
  appName: string;
};

export const getSidecar = (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (<any>window).__cogniteSidecar;
};

type ValidationResult = {
  status: number; // HTTP status code
};

export type TenantValidator = (tenant: string) => Promise<ValidationResult>;

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
