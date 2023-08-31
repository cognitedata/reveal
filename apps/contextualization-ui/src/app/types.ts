export enum JobStatus {
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface Table {
  id?: string;
  tableName: string;
  databaseName: string;
}

export type EstimateJobPercentages = {
  contextualizationScorePercent: number | undefined;
  estimatedCorrectnessScorePercent: number | undefined;
  confidencePercent: number | undefined;
};

export type MatchData = {
  type: string;
  space: string;
  externalId: string;
  linkedSpace: string;
  linkedExternalId: string;
  properties: {};
};

export type MatchInputOption = {
  value: string;
  label: string;
};

export type MatchedInstance = { value: string; key: string };

export type ManualMatch = {
  originExternalId: string;
  matchedInstance?: MatchedInstance;
  shouldNotMatch?: boolean;
};

export type ImprovementSuggestion = {
  type: string;
  space: string;
  originExternalId: string;
  propertyName: string;
};

export type ModelInstance = {
  externalId: string;
  properties: any;
};

export type InternalModelInstance = {
  externalId: string;
} & Record<string, string>;

export type ObjectProperty = { space: string; externalId: string };

export interface EstimateArray extends Table {
  status?: JobStatus;
  jobResponse?: EstimateJobPercentages;
}

export type SelectedColumns = {
  fromColumn: string | undefined;
  toColumn: string | undefined;
};

export interface RawTableProps {
  name: string;
}
