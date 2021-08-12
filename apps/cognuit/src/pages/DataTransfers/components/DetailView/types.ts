type StepType = {
  status: string;
  // eslint-disable-next-line camelcase
  error_message: string | null;
  // eslint-disable-next-line camelcase
  created_time: number;
};

export type SourceType = {
  name?: string;
  externalId?: string;
  crs?: string;
  dataType?: string;
  createdTime?: number;
  repository?: string;
  businessTag?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  interpreter?: string | null;
  qualityTags?: any[];
  cdfMetadata?: {
    [key: string]: any;
  };
};

export type TargetType = {
  name?: string;
  owId?: string;
  crs?: string;
  dataType?: string;
  openWorksId?: string;
  createdTime?: number;
  repository?: string;
  configTag?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  cdfMetadata?: {
    [key: string]: any;
  };
};
