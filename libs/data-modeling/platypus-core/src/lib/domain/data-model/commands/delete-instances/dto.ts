export interface DeleteInstancesDTO {
  dataModelExternalId?: string;
  space: string;
  type: 'node' | 'edge';
  items: {
    externalId: string;
    space: string;
  }[];
}
