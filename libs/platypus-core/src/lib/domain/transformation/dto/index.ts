import { DataModelTransformation } from '../types';

export type DataModelTransformationCreateDTO = Omit<
  DataModelTransformation,
  'id'
>;
