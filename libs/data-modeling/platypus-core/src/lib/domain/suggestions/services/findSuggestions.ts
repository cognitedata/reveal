/**
 * This file is owned and provided by the Matchmaker team
 */
import { DMSRecord, SuggestionsMatch } from '../types';

import {
  cosineSimilarity,
  countDocumentFrequencies,
  createQgramTokenizer,
  createTfidfVectorSpaceModel,
  createVocabulary,
  SimilarityIndex,
  SparseVector,
} from './token-set-similarity-search';

const PROTOTYPE_SMOOTHING = 0.5;

interface IdentifiableSparseVector extends SparseVector {
  externalId: string;
}

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
  const sourceStrings = new Map(
    sourceRecords.map((r) => [r.externalId, recordToString(r, sourceColumns)])
  );
  const targetStrings = new Map(
    targetRecords.map((r) => [r.externalId, recordToString(r, targetColumns)])
  );
  const tokenizer = createQgramTokenizer(2, ' ');
  const sourceDocumentFrequencies = countDocumentFrequencies(
    Array.from(sourceStrings.values()),
    tokenizer
  );
  const targetDocumentFrequencies = countDocumentFrequencies(
    Array.from(targetStrings.values()),
    tokenizer
  );
  const vocabulary = createVocabulary(targetDocumentFrequencies);
  const sourceVsm = createTfidfVectorSpaceModel(
    tokenizer,
    vocabulary,
    sourceDocumentFrequencies,
    sourceStrings.size
  );
  const targetVsm = createTfidfVectorSpaceModel(
    tokenizer,
    vocabulary,
    targetDocumentFrequencies,
    targetStrings.size
  );
  const sourceVectors: IdentifiableSparseVector[] = Array.from(
    sourceStrings.entries()
  ).map(([externalId, s]) => ({
    ...sourceVsm(s),
    externalId,
  }));
  const targetVectors: Map<string, IdentifiableSparseVector> = new Map(
    Array.from(targetStrings.entries()).map(([externalId, s]) => [
      externalId,
      {
        ...targetVsm(s),
        externalId,
      },
    ])
  );

  const knownTargetVectors = sourceRecords
    .filter((r) => r[fillColumn])
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((r) => targetVectors.get(r[fillColumn].externalId)!);

  // Don't compare against known targets before we have at least three examples
  // to avoid "overfitting" to the few suggestions
  if (knownTargetVectors.length >= 3) {
    const prototypeVector = averageVectors(knownTargetVectors);
    prototypeAdjustVectors(targetVectors, prototypeVector);
  }

  const targetVectorsToIndex = Array.from(targetVectors.values());
  const similarityIndex = new SimilarityIndex(
    targetVectorsToIndex,
    vocabulary.size,
    0.0
  );

  const matches = [];
  const externalIdToSourceRecord: Map<string, DMSRecord> = new Map(
    sourceRecords.map((r) => [r.externalId, r])
  );
  const searchResults = similarityIndex.search(sourceVectors, { topK: 1 });
  for (let i = 0; i < sourceVectors.length; i++) {
    const sourceVector = sourceVectors[i];
    const searchResult = {
      vectors: searchResults.vectors[i],
      similarities: searchResults.similarities[i],
    };
    if (searchResult.vectors.length === 0) {
      continue;
    }
    const retrievedTargetVector = searchResult.vectors[0];
    const similarity = searchResult.similarities[0];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentTarget = externalIdToSourceRecord.get(
      sourceVector.externalId
    )![fillColumn];
    if (
      currentTarget === null ||
      currentTarget === undefined ||
      currentTarget.externalId !== retrievedTargetVector.externalId
    ) {
      matches.push({
        sourceExternalId: sourceVector.externalId,
        targetExternalId: retrievedTargetVector.externalId,
        score: similarity,
      });
    }
  }

  return Promise.resolve(matches);
};

const averageVectors = (vectors: SparseVector[]): SparseVector => {
  const values: Map<number, number> = new Map();
  for (const vector of vectors) {
    for (let i = 0; i < vector.indexes.length; i++) {
      const index = vector.indexes[i];
      const value = vector.values[i];
      values.set(index, value + (values.get(index) || 0.0));
    }
  }
  const vector: SparseVector = { indexes: [], values: [], l2Sum: 0.0 };
  Array.from(values.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([i, v]) => {
      vector.indexes.push(i);
      const averageValue = v / vectors.length;
      vector.values.push(averageValue);
      vector.l2Sum += averageValue * averageValue;
    });
  return vector;
};

const prototypeAdjustVectors = (
  vectors: Map<string, IdentifiableSparseVector>,
  prototypeVector: SparseVector
) => {
  for (const [_, vector] of vectors) {
    const similarity = cosineSimilarity(vector, prototypeVector);
    vector.l2Sum = 0.0;
    for (let i = 0; i < vector.values.length; i++) {
      vector.values[i] *=
        (similarity + PROTOTYPE_SMOOTHING) / (1 + PROTOTYPE_SMOOTHING);
      vector.l2Sum += vector.values[i] * vector.values[i];
    }
  }
};

const recordToString = (record: DMSRecord, columns: string[]): string => {
  const concatenated = columns.map((c) => record[c]).join(' ');
  const preprocessed = preprocessString(concatenated);
  return preprocessed;
};

const preprocessString = (s: string): string => {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]/gu, ' ')
    .trim();
};
