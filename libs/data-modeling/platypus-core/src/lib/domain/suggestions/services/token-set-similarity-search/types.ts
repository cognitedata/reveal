export type Tokenizer = (s: string) => string[];
export type VectorSpaceModel = (s: string) => SparseVector;
export interface SparseVector {
  indexes: number[]; // Always assumed to be sorted
  values: number[];
  l2Sum: number; // Always assumed to be the sum of squared values
}
export type DocumentFrequencies = Map<string, number>;
export type Vocabulary = Map<string, number>;
