import {
  Tokenizer,
  DocumentFrequencies,
  Vocabulary,
  VectorSpaceModel,
  SparseVector,
} from './types';

export const createQgramTokenizer = (q: number, pad?: string): Tokenizer => {
  return (s: string) => {
    if (pad) {
      s = pad.repeat(q - 1) + s + pad.repeat(q - 1);
    }
    const qgrams = [];
    for (let i = 0; i < s.length - q + 1; i++) {
      qgrams.push(s.substring(i, i + q));
    }
    return qgrams;
  };
};

export const countDocumentFrequencies = (
  corpus: string[],
  tokenizer: Tokenizer
): DocumentFrequencies => {
  const df = new Map<string, number>();
  const tokenSet: Set<string> = new Set();
  for (const s of corpus) {
    tokenSet.clear();
    tokenizer(s).forEach((t) => tokenSet.add(t));
    for (const token of tokenSet) {
      const current = df.get(token) || 0;
      df.set(token, current + 1);
    }
  }
  return df;
};

export const createVocabulary = (
  documentFrequencies: DocumentFrequencies
): Vocabulary => {
  const entries = Array.from(documentFrequencies.entries());
  entries.sort(([_tA, dfA], [_tB, dfB]) => dfA - dfB);
  const vocbulary = new Map();
  entries.forEach(([token, _df], i) => {
    vocbulary.set(token, i);
  });
  return vocbulary;
};

export const createTfidfVectorSpaceModel = (
  tokenizer: Tokenizer,
  vocabulary: Vocabulary,
  documentFrequencies: DocumentFrequencies,
  numberOfDocuments: number
): VectorSpaceModel => {
  const defaultIdf = calculateIdf(0, numberOfDocuments);
  const tokenIdToTfidf: number[] = new Array(vocabulary.size);
  tokenIdToTfidf.fill(defaultIdf);
  const tokenToTfidf: Map<string, number> = new Map();
  for (const [token, tokenId] of vocabulary) {
    const df = documentFrequencies.get(token) || 0;
    tokenIdToTfidf[tokenId] = calculateIdf(df, numberOfDocuments);
  }
  for (const [token, df] of documentFrequencies) {
    tokenToTfidf.set(token, calculateIdf(df, numberOfDocuments));
  }

  return (s: string) => {
    const knownTokens = [];
    const unknownTokens = [];
    for (const token of tokenizer(s)) {
      const tokenId = vocabulary.get(token);
      if (tokenId !== undefined) {
        knownTokens.push(tokenId);
      } else {
        unknownTokens.push(token);
      }
    }

    // Calculate tfidf add contribution to l2 sum of out-of-vocabulary tokens
    // Count term frequencies by first sorting and counting sequential duplicates
    let l2SumOfUnknownTokens = 0.0;
    let tf = 0;
    unknownTokens.sort();
    for (let i = 0; i < unknownTokens.length; i++) {
      tf += 1;
      if (
        i === unknownTokens.length - 1 ||
        unknownTokens[i] !== unknownTokens[i + 1]
      ) {
        const idf = tokenToTfidf.get(unknownTokens[i]) || 0;
        const weight = calculateTfidf(tf, idf);
        l2SumOfUnknownTokens += weight * weight;
        tf = 0;
      }
    }

    // Construct sparse tfidf vector of tokens in vocabulary
    // Count term frequencies by first sorting and counting sequential duplicates
    knownTokens.sort((a, b) => a - b);
    const vector: SparseVector = { indexes: [], values: [], l2Sum: 0.0 };
    tf = 0;
    for (let i = 0; i < knownTokens.length; i++) {
      tf += 1;
      if (
        i === knownTokens.length - 1 ||
        knownTokens[i] !== knownTokens[i + 1]
      ) {
        const idf = tokenIdToTfidf[knownTokens[i]] || 0;
        const weight = calculateTfidf(tf, idf);
        vector.indexes.push(knownTokens[i]);
        vector.values.push(weight);
        vector.l2Sum += weight * weight;
        tf = 0;
      }
    }

    // Normalize vector (with out-of-vocabulary tokens!) to unit length.
    // NB! Since the vector representation is missing out-of-vocabulary tokens
    // the actual vector representation might not be unit length.
    const l2Norm = Math.sqrt(vector.l2Sum + l2SumOfUnknownTokens);
    for (let i = 0; i < vector.values.length; i++) {
      vector.values[i] /= l2Norm;
    }
    vector.l2Sum /= vector.l2Sum + l2SumOfUnknownTokens;

    return vector;
  };
};

/**
 * Cosine similarity (for normalized vectors).
 * @param a Sparse vector.
 * @param b Sparse vector.
 * @returns Dot product of a and b.
 */
export const cosineSimilarity = (a: SparseVector, b: SparseVector): number => {
  let dotProduct = 0;
  let i = 0;
  let j = 0;
  while (i < a.indexes.length && j < b.indexes.length) {
    if (a.indexes[i] === b.indexes[j]) {
      dotProduct += a.values[i] * b.values[j];
      i++;
      j++;
    } else if (a.indexes[i] < b.indexes[j]) {
      i++;
    } else {
      j++;
    }
  }
  return dotProduct;
};

const calculateIdf = (df: number, numberOfDocuments: number): number =>
  Math.log2((numberOfDocuments + 1) / (df + 1));
const calculateTfidf = (tf: number, idf: number): number =>
  Math.log2(tf + 1) * idf;
