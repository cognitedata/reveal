/**
 * This file is owned by the Matchmaker team
 */
import { DMSRecord, SuggestionsMatch, Tokenizer, Vector } from '../types';

const PROTOTYPE_SMOOTHING = 0.5;

/**
 * Provided by the match maker team
 */
export const findSuggestions = <A extends DMSRecord, B extends DMSRecord>({
  sourceRecords,
  targetRecords,
  fillColumn,
  sourceColumns,
  targetColumns,
}: {
  sourceRecords: A[];
  targetRecords: B[];
  fillColumn: string;
  sourceColumns: string[];
  targetColumns: string[];
}): Promise<SuggestionsMatch[]> => {
  const tokenizer = createQgramTokenizer(2);
  const sourceVectors = normalizeVectors(
    recordsToTfidfVectors(sourceRecords, sourceColumns, tokenizer)
  );
  const targetVectors = normalizeVectors(
    recordsToTfidfVectors(targetRecords, targetColumns, tokenizer)
  );

  const knownTargetVectors = sourceRecords
    .filter((r) => r[fillColumn])
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((r) => targetVectors.get(r[fillColumn].externalId)!);

  if (knownTargetVectors.length === 0) {
    return Promise.resolve([]);
  }

  const targetPrototype = normalizeVector(
    createPrototypeVector(knownTargetVectors)
  );
  const targetSimilarityToPrototype = new Map(
    Array.from(targetVectors).map(([externalId, v]) => [
      externalId,
      cosineSimilarity(v, targetPrototype),
    ])
  );

  const matches = [];
  for (const [sourceExternalId, sourceVector] of sourceVectors) {
    const { targetExternalId, score, relativeScore } = findSuggestedTarget(
      sourceVector,
      targetVectors,
      targetSimilarityToPrototype
    );
    const currentEntry = sourceRecords.find(
      (el) => el.externalId === sourceExternalId
    );

    if (
      score > 0 &&
      relativeScore > 0 &&
      (currentEntry
        ? currentEntry[fillColumn]?.externalId !== targetExternalId
        : false)
    ) {
      matches.push({
        sourceExternalId,
        targetExternalId,
        score,
        relativeScore,
      });
    }
  }
  return Promise.resolve(matches);
};

const findSuggestedTarget = (
  sourceVector: Vector,
  targetVectors: Map<string, Vector>,
  targetSimilarityToPrototype: Map<string, number>
): { targetExternalId: string; score: number; relativeScore: number } => {
  const results = [];
  for (const [targetExternalId, targetVector] of targetVectors) {
    results.push({
      targetExternalId,
      score:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ((targetSimilarityToPrototype.get(targetExternalId)! +
          PROTOTYPE_SMOOTHING) /
          (1 + PROTOTYPE_SMOOTHING)) *
        cosineSimilarity(targetVector, sourceVector),
    });
  }
  results.sort((a, b) => b.score - a.score);
  const relativeScore =
    (results[0].score - results[1].score) / results[0].score;
  return {
    targetExternalId: results[0].targetExternalId,
    score: results[0].score,
    relativeScore,
  };
};

// ! Vectors must be sorted and normalized
const cosineSimilarity = (a: Vector, b: Vector) => {
  let dotProduct = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const cmp = a[i][0].localeCompare(b[j][0]);
    if (cmp === 0) {
      dotProduct += a[i][1] * b[j][1];
      i += 1;
      j += 1;
    } else if (cmp < 0) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return dotProduct;
};

const normalizeVectors = (
  vectors: Map<string, Vector>
): Map<string, Vector> => {
  return new Map(
    Array.from(vectors).map(([k, vector]) => [k, normalizeVector(vector)])
  );
};
const normalizeVector = (vector: Vector): Vector => {
  const norm = Math.sqrt(
    vector.map(([, weight]) => weight * weight).reduce((a, b) => a + b, 0)
  );
  return vector.map(([token, weight]) => [token, weight / norm]);
};

const createPrototypeVector = (vectors: Vector[]): Vector => {
  if (vectors.length === 1) {
    return vectors[0];
  }
  const totalWeight: Map<string, number> = new Map();
  const count: Map<string, number> = new Map();
  for (const vector of vectors) {
    for (const [token, weight] of vector) {
      totalWeight.set(token, (totalWeight.get(token) || 0) + weight);
      count.set(token, (count.get(token) || 0) + 1);
    }
  }
  const prototype: Vector = Array.from(totalWeight)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .filter(([token, _]) => count.get(token)! > 1)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(([token, weight]) => [token, weight / count.get(token)!]);
  prototype.sort((a, b) => a[0].localeCompare(b[0]));
  return prototype;
};

const recordsToTfidfVectors = (
  records: DMSRecord[],
  columns: string[],
  tokenizer: Tokenizer
): Map<string, Vector> => {
  const vectors = records.map((r) =>
    recordToFrequencyVector(r, columns, tokenizer)
  );
  const documentFrequency: Map<string, number> = new Map();
  for (const vector of vectors) {
    for (const [token, _] of vector) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }
  for (const vector of vectors) {
    for (let i = 0; i < vector.length; i++) {
      const [token, _] = vector[i];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      vector[i][1] *= Math.log2(vectors.length / documentFrequency.get(token)!);
    }
  }
  return new Map(vectors.map((v, i) => [records[i].externalId, v]));
};

const recordToFrequencyVector = (
  record: DMSRecord,
  columns: string[],
  tokenizer: Tokenizer
): Vector => {
  const concatenated = columns.map((c) => record[c]).join(' ');
  const preprocessed = preprocessString(concatenated);
  const tokens = tokenizer(preprocessed);
  const tokenFrequency: Map<string, number> = new Map();
  for (const token of tokens) {
    tokenFrequency.set(token, (tokenFrequency.get(token) || 0) + 1);
  }
  const vector = Array.from(tokenFrequency);
  vector.sort((a, b) => a[0].localeCompare(b[0]));
  return vector;
};

const preprocessString = (s: string): string => {
  return ` ${s
    .normalize('NFKC')
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]/gu, ' ')
    .trim()} `;
};

const createQgramTokenizer = (q: number): Tokenizer => {
  return (s: string) => {
    const qgrams = [];
    for (let i = 0; i < s.length - q + 1; i++) {
      qgrams.push(s.substring(i, i + q));
    }
    return qgrams;
  };
};
