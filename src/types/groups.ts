import {
  AclScopeAll,
  AclScopeAssetsId,
  AclScopeCurrentUser,
  AclScopeDatasetsIds,
  AclScopeIds,
  AclScopeTimeSeriesAssetRootIds,
} from '@cognite/sdk';

export type ValidateStatus =
  | 'success'
  | 'warning'
  | 'error'
  | 'validating'
  | '';

export interface FormValue<T> {
  value: T;
  validateStatus: ValidateStatus;
  errorMessage: string;
}

export type AclScopeTableIds = {
  tableScope: { dbsToTables?: Record<string, { tables: string[] }> };
};

export type AclScopeids = { idscope: { ids: Array<number> } };

export type AclScopeExtractionPipelines = {
  extractionPipelineScope: { ids: Array<number> };
};

export type AclScopePartitions = { partition: { partitionIds: Array<number> } };

interface BaseCapabilityScope<ScopeNames> {
  scope: ScopeNames;
}

export type CapabilityScope =
  | (BaseCapabilityScope<ScopeNames.AllScopes> & AclScopeAll)
  | (BaseCapabilityScope<ScopeNames.CurrentUserScope> & AclScopeCurrentUser)
  | (BaseCapabilityScope<ScopeNames.TableScope> & AclScopeTableIds)
  | (BaseCapabilityScope<ScopeNames.Idscope> & AclScopeids)
  | (BaseCapabilityScope<ScopeNames.IdScope> & AclScopeIds)
  | (BaseCapabilityScope<ScopeNames.DatasetScope> & AclScopeDatasetsIds)
  | (BaseCapabilityScope<ScopeNames.ExtractionPipelineScope> &
      AclScopeExtractionPipelines)
  | (BaseCapabilityScope<ScopeNames.AssetIdScope> & AclScopeAssetsId)
  | (BaseCapabilityScope<ScopeNames.AssetRootIdScope> &
      AclScopeTimeSeriesAssetRootIds)
  | (BaseCapabilityScope<ScopeNames.PartitionScope> & AclScopePartitions);

export enum CapabilityNames {
  Assets = 'assetsAcl',
  DataSets = 'datasetsAcl',
  Events = 'eventsAcl',
  ExtractionPipelines = 'extractionPipelinesAcl',
  Files = 'filesAcl',
  SecurityCategories = 'securityCategoriesAcl',
  Sequences = 'sequencesAcl',
  TemplateInstances = 'templateInstancesAcl',
  TimeSeries = 'timeSeriesAcl',
}

export enum ScopeNames {
  AllScopes = 'all',
  AssetIdScope = 'assetIdScope',
  AssetRootIdScope = 'assetRootIdScope',
  CurrentUserScope = 'currentuserscope',
  DatasetScope = 'datasetScope',
  ExtractionPipelineScope = 'extractionPipelineScope',
  Idscope = 'idscope',
  IdScope = 'idScope',
  PartitionScope = 'partition',
  TableScope = 'tableScope',
}
