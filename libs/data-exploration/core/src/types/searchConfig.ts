export type FilterIdType =
  | keyof AssetConfigType
  | keyof TimeseriesConfigType
  | keyof SequenceConfigType
  | keyof FileConfigType
  | keyof EventConfigType;

export type SearchConfigResourceType = keyof SearchConfigDataType;

export type SearchConfig = {
  label: string;
  enabled: boolean;
  enabledFuzzySearch?: boolean;
};

type CommonKeys = {
  externalId: SearchConfig;
  id: SearchConfig;
};

export type AssetConfigType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  source: SearchConfig;
  labels: SearchConfig;
};

export type TimeseriesConfigType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  unit: SearchConfig;
};

export type SequenceConfigType = CommonKeys & {
  name: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
};

export type FileConfigType = CommonKeys & {
  'sourceFile|name'?: SearchConfig;
  content: SearchConfig;
  'sourceFile|metadata': SearchConfig;
  'sourceFile|source': SearchConfig;
  labels: SearchConfig;
};

export type EventConfigType = CommonKeys & {
  type: SearchConfig;
  description: SearchConfig;
  metadata: SearchConfig;
  source: SearchConfig;
  subtype: SearchConfig;
};

export type SearchConfigDataType = {
  asset: AssetConfigType;
  timeSeries: TimeseriesConfigType;
  sequence: SequenceConfigType;
  file: FileConfigType;
  event: EventConfigType;
};
