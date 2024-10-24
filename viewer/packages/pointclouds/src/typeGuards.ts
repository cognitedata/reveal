import {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  isClassicIdentifier,
  isDMIdentifier
} from '@reveal/data-providers';
import { CognitePointCloudModel } from './CognitePointCloudModel';

export function isDMPointCloudModel(
  model: CognitePointCloudModel<DataSourceType>
): model is CognitePointCloudModel<DMDataSourceType> {
  return isDMIdentifier(model.modelIdentifier);
}

export function isClassicPointCloudModel(
  model: CognitePointCloudModel<DataSourceType>
): model is CognitePointCloudModel<ClassicDataSourceType> {
  return isClassicIdentifier(model.modelIdentifier);
}
