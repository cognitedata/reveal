import {
  CogniteEvent,
  ExternalFileInfo,
  ExternalSequence,
  Asset,
  Timeseries,
  DataSet as ApiDataSet,
  Group,
} from '@cognite/sdk';

export type APIDataSet = ApiDataSet;

export interface DataSetV3 {
  externalId?: string;
  name: string;
  description: string;
  writeProtected: boolean;
  metadata: {
    archived: boolean;
    consoleLabels?: string[];
    consoleGoverned: boolean;
    consoleCreatedBy: { username: string };
    consoleOwners: ConsoleOwners[];
    consoleMetaDataVersion: 3;
    consoleSource: {
      names?: string[];
      description?: string;
      external?: boolean;
    };
    consoleExtractors?: {
      accounts: string[];
    };
    rawTables?: RawTable[];
    transformations?: TransformationDetails[];
    consoleAdditionalDocs: Documentation[];
    consumers?: Consumer[];
  };
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface DataSetV2 {
  externalId?: string;
  name: string;
  description: string;
  writeProtected: boolean;
  metadata: {
    consoleLabels?: string[];
    consoleQuality?: { approved: boolean; text: string };
    consoleCreatedBy: { username: string };
    consoleOwners: ConsoleOwners[];
    consoleVersion: 2;
    consoleSource: {
      names?: string[];
      description?: string;
      external?: boolean;
    };
    consoleExtractors?: {
      accounts?: string[];
      description?: string;
    };
    rawTables?: RawTable[];
    transformations?: TransformationDetails[];
    consoleAdditionalDocs: Documentation[];
  };
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}
export interface DataSetV1 {
  externalId: string;
  name: string;
  description: string;
  writeProtected: boolean;
  metadata: {
    consoleLabels?: string[];
    consoleQuality?: { approved: boolean; text: string };
    consoleCreatedBy: { username: string };
    consoleOwners: ConsoleOwners[];
    consoleVersion?: 1;
    consoleSource: {
      name?: string;
      description?: string;
      external?: boolean;
    };
    consoleExtractors?: {
      accounts?: string[];
      extractionDetails?: Documentation[];
    };
    rawTables?: RawTable[];
    transformations?: string[];
    consoleAdditionalDocs: Documentation[];
  };
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface CreationDataSet {
  name: string;
  externalId?: string;
  description: string;
  metadata: {
    consoleCreatedBy: {
      username: string;
    };
    consoleMetaDataVersion: number;
    consoleLabels?: string[];
  };
  writeProtected?: boolean;
}

export interface ExploreViewConfig {
  visible: boolean;
  type?: 'ts' | 'asset' | 'event' | 'file' | 'sequence' | 'events-profile';
  id?: string | number;
}

interface ConsoleOwners {
  name: string;
  email: string;
}

export interface TransformationDetails {
  type: 'jetfire' | 'external';
  name: string;
  details?: string;
}
export interface Documentation {
  type: string;
  id: string;
  name: string;
}

export interface RawTable {
  databaseName: string;
  tableName: string;
}

export interface ExternalLink {
  rel: string;
  href: string;
}

export interface Consumer {
  name: string;
  contact: {
    email: string;
  };
  externalLinks: ExternalLink[];
}

export interface ExtpipeUserInfo {
  name?: string;
  email: string;
  role?: string;
  sendNotification?: boolean;
}
export enum SupportedSchedule {
  ON_TRIGGER = 'On Trigger',
  CONTINUOUS = 'Continuous',
  SCHEDULED = 'Scheduled',
}
interface IntegrationRawTable {
  dbName: string;
  tableName: string;
}
export interface RawTableWithIntegrations extends RawTable {
  integrations: Integration[];
}
export interface Integration {
  id: number;
  name: string;
  createdTime: number; // milliseconds
  lastUpdatedTime: number; // milliseconds
  externalId: string;
  description?: string;
  dataSetId: number;
  createdBy: string;
  schedule?: string;
  rawTables?: IntegrationRawTable[];
  source?: string;
  lastSuccess?: number; // milliseconds
  lastFailure?: number; // milliseconds
  lastSeen?: number; // milliseconds
  lastMessage?: string;
  contacts: IntegrationUserInfo[];
}

export type FileInfo = {
  id: number;
  name: string;
};

export interface ExploreData {
  timeseries: {
    count: number;
    data: Timeseries[];
  };
  assets: {
    count: number;
    data: Asset[];
  };
  events: {
    count: number;
    data: CogniteEvent[];
  };
  files: {
    count: number;
    data: ExternalFileInfo[];
  };
  sequences: {
    count: number;
    data: ExternalSequence[];
  };
}

export type DataSet = DataSetV3;

export interface UpdateGroupData {
  cdfToken: string;
  id: Group['id'];
  update: any;
  // update: Partial<Omit<Group, 'id' | 'isDeleted' | 'deletedTime'>>;
}
