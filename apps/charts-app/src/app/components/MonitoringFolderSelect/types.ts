export type MonitoringFolder = {
  id: number;
  parentId: null | number;
  externalId: string;
  parentExternalId: null | string;
  name: string;
  description: string;
  metadata: object;
};

export type MonitoringFolderCreatePayload = {
  folderExternalID: string;
  folderName: string;
};

export type MonitoringFolderListPayload = {
  items: MonitoringFolder[];
};
