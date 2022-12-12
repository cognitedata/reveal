/**
 * This file is owned by the Matchmaker team
 */
export type Vector = [string, number][];
export type Tokenizer = (s: string) => string[];

export interface DMSRecord {
  externalId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SuggestionsMatch {
  sourceExternalId: string;
  targetExternalId: string;
  score: number;
  relativeScore: number;
}
