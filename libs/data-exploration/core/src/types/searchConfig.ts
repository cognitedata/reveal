import { ResourceType } from './resource';

export type SearchConfigDataIdType =
  | 'name_or_type'
  | 'description_or_content'
  | 'external_id'
  | 'id'
  | 'metadata'
  | 'source'
  | 'label'
  | 'unit'
  | 'subtype';

export type SearchConfigColumnType = {
  id: SearchConfigDataIdType;
  label: string;
  isChecked?: boolean;
};

export type SearchConfigDataType = {
  resourceType: ResourceType;
  columns: SearchConfigColumnType[];
};
