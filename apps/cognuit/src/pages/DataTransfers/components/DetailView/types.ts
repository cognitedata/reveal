type StepType = {
  status: string;
  // eslint-disable-next-line camelcase
  error_message: string | null;
  // eslint-disable-next-line camelcase
  created_time: number;
};

export type SourceType = {
  id?: number;
  externalId?: string;
  name?: string;
  crs?: string;
  dataType?: string;
  createdTime?: number;
  lastUpdated?: number;
  repository?: string;
  businessTags?: string;
  statusTags?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  author?: string | null;
  grouping?: string | null;
  cdfMetadata?: {
    [key: string]: any;
  };
};

export type TargetType = {
  id?: number;
  externalId?: string;
  name?: string;
  crs?: string;
  dataType?: string;
  createdTime?: number;
  lastUpdated?: number;
  repository?: string;
  configTag?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  cdfMetadata?: {
    [key: string]: any;
  };
};
