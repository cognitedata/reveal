export type Rule = {
  id: string;
  expression: string;
  result: Record<string, string>;
};

export type RuleSet = {
  id: string;
  name: string;
  rules: Rule[];
};

export type ShapeAttribute = {
  id: string;
  name: string;
  type: 'TIMESERIES' | 'ASSET';
  externalId: string;
  extractor: 'CURRENT_VALUE' | 'METADATA' | 'TIMESTAMP';
  subExtractor?: string;
};

export type SmartShape = {
  shapeId: string;
  attributes: Record<string, ShapeAttribute>;
  ruleSets: RuleSet[];
};
