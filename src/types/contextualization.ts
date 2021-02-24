export type FeatureType =
  | 'simple'
  | 'bigram'
  | 'frequency-weighted-bigram'
  | 'bigram-extra-tokenizers'
  | 'bigram-combo';

export type TrueMatch = {
  sourceId: number;
  targetId: number;
};
