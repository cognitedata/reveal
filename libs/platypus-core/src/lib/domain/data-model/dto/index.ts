import { DataModelTypeDefsField, DataModelTypeDefsFieldType } from '../types';

export * from './data-managment-handler-dtos';
export * from './data-model-storage-api-dtos';
export * from './data-model-versions-handler-dtos';
export * from './data-models-handler-dtos';
export * from './mixer-api-dtos';

export type ConflictMode = 'NEW_VERSION' | 'PATCH';

export interface UpdateDataModelFieldDTO
  extends Omit<DataModelTypeDefsField, 'type'> {
  type: DataModelTypeDefsFieldType | string;
}
