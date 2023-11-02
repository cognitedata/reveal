import { CogIdpProject } from './cogniteIdp';

export const IDP_TYPES = [
  'AZURE_AD',
  'ADFS2016',
  'AUTH0',
  'AAD_B2C',
  'KEYCLOAK',
  'COGNITE_IDP',
] as const;
export type IDPType = (typeof IDP_TYPES)[number];

export type LoginInfoError = {
  status: string;
  statusCode: number;
  message: 'API_NOT_FOUND' | 'DOMAIN_NOT_FOUND' | 'APPLICATION_NOT_FOUND';
  didYouMean?: string[];
};

export type ImageMime = 'image/png' | 'image/jpg' | 'image/svg+xml';
export interface ImageConfig {
  imagePath: string;
  imageType: ImageMime;
  imageData?: string;
}
export interface AppDomain {
  domain: string;
  internalId: string;
  label: string;
  idpIds?: string[];
  imageRectangle?: ImageConfig;
  imageSquare?: ImageConfig;
  notes?: string;
  defaultIdpId?: string;
  defaultProject?: string;
}

interface IDP {
  internalId: string;
  type: IDPType;
  label?: string;
  authority: string;
  clusters: string[];
  hasDefaultApps?: boolean;
}

export interface IDPInput extends IDP {
  policy?: string;
  appIds?: string[];
  hasDefaultApps?: boolean;
  notes?: string;
  scope?: string;
  realm?: string;
  audience?: string;
}

export interface IDPProcessed extends Omit<IDPInput, 'appIds'> {
  apps: Record<string, App>;
}

export interface App extends Record<string, any> {
  internalId: string;
  name: string;
  clientId: string;
  auth: IDPType;
  isDefault?: boolean;
  notes?: string;
}

// API response types

export type Img = {
  imageType: ImageMime;
  imageData: string;
};

export interface DomainResponse
  extends Omit<AppDomain, 'idpIDs' | 'imageRectangle' | 'imageSquare'> {
  domain: string;
  internalId: string;
  label: string;
  idps: IDPResponse[];
  imageSquare?: Img;
  imageRectangle?: Img;
}

export type IDPResponse =
  | AADResponse
  | Auth0Response
  | AADB2CResponse
  | KeycloakResponse
  | CogniteIdPResponse;

export interface AADResponse extends IDP {
  appConfiguration: {
    clientId: string;
  };
}
export interface KeycloakResponse extends IDP {
  realm: string;
  appConfiguration: {
    audience?: string;
    clientId: string;
  };
}
export interface CogniteIdPResponse extends IDP {
  projects: CogIdpProject[];
  appConfiguration: {
    clientId: string;
  };
}
export interface AADB2CResponse extends IDP {
  appConfiguration: {
    clientId: string;
  };
  policy: string;
}

export interface Auth0Response extends IDP {
  appConfiguration: {
    audience?: string;
    clientId: string;
  };
}
