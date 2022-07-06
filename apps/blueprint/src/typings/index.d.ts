import { IdEither } from '@cognite/sdk';
import { OrnateExport } from 'ornate';

// https://github.com/MattBoatman/i18next-pseudo/issues/6
declare module 'i18next-pseudo';
type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];
type LimitRule = {
  type: 'LIMIT';
  min?: number;
  max?: number;
};

export type User = {
  uid?: string;
  email?: string;
};

export type Document = {
  id: string;
  cdfFileReference?: {
    type: 'PDF' | 'IMAGE';
    id?: number;
    externalId?: string;
  };
};

export type TimeSeriesTag = {
  id: string;
  timeSeriesReference: IdEither;
  tagPosition: {
    x: number;
    y: number;
  };
  pointerPosition: {
    x: number;
    y: number;
  };
  color: string;
  rule: LimitRule;
  sticky?: boolean;
  link?: {
    URL?: string;
  };
  comment?: string;
};

export type BlueprintReference = {
  id?: number;
  externalId: string;
  name: string;
  lastOpened: number;
  createdBy: User;
};
export type NonPDFFile = {
  x: number;
  y: number;
  fileId: number;
  fileExternalId: string;
};

export type ShapeAttribute = {
  id: string;
  name: string;
  type: 'TIMESERIES' | 'ASSET';
  externalId: string;
  extractor: 'CURRENT_VALUE' | 'METADATA' | 'TIMESTAMP';
  subExtractor?: string;
};

export type RuleOutput = {
  id?: string;
  fill?: string;
  stroke?: string;
};
export type Rule<T> = {
  id: string;
  expression: string;
  output: T;
};

export type RuleSet = {
  id: string;
  name: string;
  rules: Rule<RuleOutput>[];
};

export type BlueprintDefinition = {
  id?: string;
  externalId: string;
  name: string;
  createdBy: User;
  lastOpened: number;
  nonPDFFiles: NonPDFFile[];
  ornateShapes: OrnateExport;
  timeSeriesTags: TimeSeriesTag[];
  drawings?: Drawing[];
  shapeAttributes?: Record<string, ShapeAttribute[]>;
  ruleSets?: RuleSet[];
  shapeRuleSets?: Record<string, string[]>;
};
