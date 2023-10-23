export type RuleCondition = {
  conditionType: 'equals';
  arguments: number[][];
};

export type RuleExtractor = {
  entitySet: 'sources' | 'targets';
  extractorType: 'regex';
  field: string;
  pattern: string;
};

export type Rule = {
  priority: number;
  conditions: RuleCondition[];
  extractors: RuleExtractor[];
};

export type RuleMatch = {
  score: number;
  source: { id: number } & Record<string, unknown>;
  target: { id: number } & Record<string, unknown>;
};

export type AppliedRule = {
  numberOfMatches: number;
  averageScore: number;
  matches: RuleMatch[];
  rule: Rule;
};
