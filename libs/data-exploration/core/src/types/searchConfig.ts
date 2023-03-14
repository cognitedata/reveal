export type FilterIdType =
  | keyof AssetType
  | keyof TimeseriesType
  | keyof SequenceType
  | keyof FileType
  | keyof EventType;

export type SearchConfigResourceType = keyof SearchConfigDataType;

export type SearchConfig = { label: string; enabled: boolean };

type CommonKeys = {
  externalId: SearchConfig;
  id: SearchConfig;
};

type AssetType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  source: SearchConfig;
  labels: SearchConfig;
};

type TimeseriesType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  unit: SearchConfig;
};

type SequenceType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
};

type FileType = CommonKeys & {
  'sourceFile|name'?: SearchConfig;
  content: SearchConfig;
  'sourceFile|metadata': SearchConfig;
  'sourceFile|source': SearchConfig;
  labels: SearchConfig;
};

type EventType = CommonKeys & {
  type: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  source: SearchConfig;
  subtype: SearchConfig;
};

export type SearchConfigDataType = {
  asset: AssetType;
  timeSeries: TimeseriesType;
  sequence: SequenceType;
  file: FileType;
  event: EventType;
};
