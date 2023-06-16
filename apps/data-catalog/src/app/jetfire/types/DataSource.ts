/* eslint-disable max-classes-per-file */
import NotImplementedError from './NotImplementedError';

export enum DataSourceType {
  Assets = 'assets',
  AssetHierarchy = 'asset_hierarchy',
  Events = 'events',
  Files = 'files',
  Raw = 'raw',
  Sequences = 'sequences',
  Timeseries = 'timeseries',
  Datapoints = 'datapoints',
  StringDatapoints = 'string_datapoints',
  Labels = 'labels',
  Relationships = 'relationships',
  DataSets = 'data_sets',
}

export enum ConflictMode {
  Abort = 'abort',
  Update = 'update',
  Upsert = 'upsert',
  Delete = 'delete',
}

export class Raw {
  type: DataSourceType.Raw = DataSourceType.Raw;

  constructor(
    readonly database: string,
    readonly table: string // eslint-disable-next-line no-empty-function
  ) {}
}

export const Assets = { type: DataSourceType.Assets as DataSourceType.Assets };
export const Events = { type: DataSourceType.Events as DataSourceType.Events };
export const Files = { type: DataSourceType.Files as DataSourceType.Files };
export const AssetHierarchy = {
  type: DataSourceType.AssetHierarchy as DataSourceType.AssetHierarchy,
};
export const Sequences = {
  type: DataSourceType.Sequences as DataSourceType.Sequences,
};
export const Timeseries = {
  type: DataSourceType.Timeseries as DataSourceType.Timeseries,
};
export const Datapoints = {
  type: DataSourceType.Datapoints as DataSourceType.Datapoints,
};
export const StringDatapoints = {
  type: DataSourceType.StringDatapoints as DataSourceType.StringDatapoints,
};
export const Labels = { type: DataSourceType.Labels as DataSourceType.Labels };
export const Relationships = {
  type: DataSourceType.Relationships as DataSourceType.Relationships,
};
export const DataSets = {
  type: DataSourceType.DataSets as DataSourceType.DataSets,
};

export type DataSource =
  | Raw
  | typeof Assets
  | typeof AssetHierarchy
  | typeof Events
  | typeof Files
  | typeof Sequences
  | typeof Timeseries
  | typeof Datapoints
  | typeof StringDatapoints
  | typeof Labels
  | typeof Relationships
  | typeof DataSets;

export const conflictModeToHumanDescription = (c: ConflictMode) => {
  const lookup = {
    [ConflictMode.Abort]: 'Create',
    [ConflictMode.Delete]: 'Delete',
    [ConflictMode.Update]: 'Update',
    [ConflictMode.Upsert]: 'Create or update',
  };
  return lookup[c];
};

export const dataSourceTypeHumanDescription = (d: DataSourceType) => {
  const lookup = {
    [DataSourceType.Assets]: 'assets',
    [DataSourceType.AssetHierarchy]: 'asset hierarchy',
    [DataSourceType.Events]: 'events',
    [DataSourceType.Files]: 'files',
    [DataSourceType.Raw]: 'RAW rows',
    [DataSourceType.Sequences]: 'sequences',
    [DataSourceType.Timeseries]: 'time series',
    [DataSourceType.Datapoints]: 'numeric datapoints',
    [DataSourceType.StringDatapoints]: 'string datapoints',
    [DataSourceType.Labels]: 'labels',
    [DataSourceType.Relationships]: 'relationships',
    [DataSourceType.DataSets]: 'datasets',
  };
  return lookup[d];
};

const relationModeSupport: { [key in DataSourceType]: ConflictMode[] } = {
  [DataSourceType.Raw]: [ConflictMode.Upsert],
  [DataSourceType.Assets]: [
    ConflictMode.Upsert,
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Delete,
  ],
  [DataSourceType.AssetHierarchy]: [ConflictMode.Upsert, ConflictMode.Delete],
  [DataSourceType.Events]: [
    ConflictMode.Upsert,
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Delete,
  ],
  [DataSourceType.Files]: [
    ConflictMode.Upsert,
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Delete,
  ],
  [DataSourceType.Sequences]: [
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Delete,
  ],
  [DataSourceType.Timeseries]: [
    ConflictMode.Upsert,
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Delete,
  ],
  [DataSourceType.Datapoints]: [ConflictMode.Upsert, ConflictMode.Delete],
  [DataSourceType.StringDatapoints]: [ConflictMode.Upsert, ConflictMode.Delete],
  [DataSourceType.Labels]: [ConflictMode.Abort, ConflictMode.Delete],
  [DataSourceType.Relationships]: [
    ConflictMode.Abort,
    ConflictMode.Delete,
    ConflictMode.Update,
    ConflictMode.Upsert,
  ],
  [DataSourceType.DataSets]: [
    ConflictMode.Abort,
    ConflictMode.Update,
    ConflictMode.Upsert,
  ],
};

export class DataSourceUtil {
  static formattedSqlRelation(source: DataSource) {
    switch (source.type) {
      case DataSourceType.Raw: {
        const quotedDatabase = `\`${source.database}\``;
        const quotedTable = `\`${source.table}\``;
        return `${quotedDatabase}.${quotedTable}`;
      }
      default:
        throw new NotImplementedError();
    }
  }

  static readonly supportedModes = (
    source: DataSourceType
  ): Array<ConflictMode> => relationModeSupport[source];
}
