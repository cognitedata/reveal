import seedrandom from 'seedrandom';

import {
  SimilarityIndex,
  SimilaritySearchConstraints,
} from './similarity-search';
import { SparseVector } from './types';
import { cosineSimilarity } from './vector-space-model';

describe('SimilarityIndex', () => {
  it('should work', () => {
    const indexVectors: SparseVector[] = [
      denseToSparseVector([1, 0, 1, 0]),
      denseToSparseVector([0, 0, 1, 1]),
      denseToSparseVector([1, 1, 0, 1]),
    ];
    const queryVectors: SparseVector[] = [
      denseToSparseVector([1, 0, 1, 0]),
      denseToSparseVector([1, 1, 1, 0]),
    ];

    const index = new SimilarityIndex(indexVectors, 4, 0.0);
    const naiveIndex = new NaiveSimilarityIndex(indexVectors);

    const searchResults = index.search(queryVectors, {});
    const naiveSearchResults = naiveIndex.search(queryVectors, {
      similarityThreshold: 0,
      relativeSimilarityThreshold: 0,
      topK: 3,
    });

    expect(searchResults).toStrictEqual(naiveSearchResults);
  });

  it.each([
    { topK: 1 },
    { topK: 10 },
    { similarityThreshold: 0.15 },
    { similarityThreshold: 0.2 },
    { relativeSimilarityThreshold: 0.7 },
    { relativeSimilarityThreshold: 0.9 },
    { topK: 5, similarityThreshold: 0.15, relativeSimilarityThreshold: 0.7 },
  ])(
    'should correctly constrain results to %p',
    (searchConstraints: SimilaritySearchConstraints) => {
      testOnRandomVectors({
        numberOfIndexVectors: 300,
        numberOfQueryVectors: 50,
        searchConstraints,
      });
    }
  );
});

const testOnRandomVectors = ({
  numberOfIndexVectors,
  numberOfQueryVectors,
  searchConstraints,
}: {
  numberOfIndexVectors: number;
  numberOfQueryVectors: number;
  searchConstraints: SimilaritySearchConstraints;
}) => {
  const dimensions = 1000;
  const indexVectors = createRandomVectors({
    numberOfVectors: numberOfIndexVectors,
    dimensions,
    minElements: 10,
    maxElements: 50,
    seed: 'index',
  });
  const queryVectors = createRandomVectors({
    numberOfVectors: numberOfQueryVectors,
    dimensions,
    minElements: 10,
    maxElements: 50,
    seed: 'query',
  });

  const index = new SimilarityIndex(
    indexVectors,
    dimensions,
    searchConstraints.similarityThreshold || 0.0
  );
  const naiveIndex = new NaiveSimilarityIndex(indexVectors);

  const { vectors: resultVectors, similarities } = index.search(
    queryVectors,
    searchConstraints
  );
  const { vectors: naiveResultVectors, similarities: naiveSimilarities } =
    naiveIndex.search(queryVectors, searchConstraints);

  expect(resultVectors).toHaveLength(queryVectors.length);
  for (let i = 0; i < resultVectors.length; i++) {
    expect(resultVectors[i]).toHaveLength(naiveResultVectors[i].length);
    expect(similarities[i]).toHaveLength(naiveSimilarities[i].length);
    for (let j = 0; j < resultVectors[i].length; j++) {
      expect(resultVectors[i][j]).toBe(naiveResultVectors[i][j]);
    }
    expect(similarities[i]).toStrictEqual(naiveSimilarities[i]);
  }
};

class NaiveSimilarityIndex<V extends SparseVector> {
  private indexVectors: V[];

  constructor(vectors: V[]) {
    this.indexVectors = vectors;
  }

  search(
    queries: SparseVector[],
    constraints: SimilaritySearchConstraints
  ): { vectors: V[][]; similarities: number[][] } {
    const similarityThreshold = constraints.similarityThreshold || 0.0;
    const relativeSimilarityThreshold =
      constraints.relativeSimilarityThreshold || 0.0;
    const topK = constraints.topK || this.indexVectors.length;

    const allVectors: V[][] = [];
    const allSimilarities: number[][] = [];

    queries.forEach((queryVector) => {
      let candidates = this.indexVectors.map((indexVector) => ({
        indexVector,
        similarity: cosineSimilarity(queryVector, indexVector),
      }));
      candidates.sort((a, b) => b.similarity - a.similarity);

      if (candidates.length > topK) {
        candidates.length = topK;
      }

      if (candidates.length > 0) {
        const topSimilarity = candidates[0].similarity;
        const threshold = Math.max(
          similarityThreshold,
          topSimilarity * relativeSimilarityThreshold
        );
        candidates = candidates.filter(
          (c) => c.similarity >= threshold && c.similarity > 0
        );
      }

      allVectors.push(candidates.map((c) => c.indexVector));
      allSimilarities.push(candidates.map((c) => c.similarity));
    });

    return { vectors: allVectors, similarities: allSimilarities };
  }
}

// Generate random sparse vectors that somewhat resembles tfidf vectors from a Zipfian corpus
const createRandomVectors = ({
  numberOfVectors,
  dimensions,
  minElements,
  maxElements,
  seed,
}: {
  numberOfVectors: number;
  dimensions: number;
  minElements: number;
  maxElements: number;
  seed: string;
}): SparseVector[] => {
  const random = seedrandom(seed);

  const vectors = [];
  for (let i = 0; i < numberOfVectors; i++) {
    const denseVector = new Array(dimensions);
    const numElements = Math.floor(
      random() * (maxElements - minElements) + minElements
    );
    for (let j = 0; j < numElements; j++) {
      let index = -1;
      while (index === -1 || denseVector[index] !== undefined) {
        index =
          dimensions - Math.floor(Math.exp(random() * Math.log(dimensions)));
      }
      denseVector[index] =
        (0.5 + 0.5 * random()) * Math.log(dimensions - index);
    }
    vectors.push(normalizeVector(denseToSparseVector(denseVector)));
  }
  return vectors;
};

const denseToSparseVector = (denseVector: number[]): SparseVector => {
  const sparseVector: SparseVector = { indexes: [], values: [], l2Sum: 0.0 };
  denseVector.forEach((v, i) => {
    if (v !== 0 && v !== undefined) {
      sparseVector.indexes.push(i);
      sparseVector.values.push(v);
      sparseVector.l2Sum += v * v;
    }
  });
  return sparseVector;
};

const normalizeVector = (vector: SparseVector): SparseVector => {
  const l2Norm = Math.sqrt(vector.l2Sum);
  return {
    indexes: vector.indexes.slice(),
    values: vector.values.map((v) => v / l2Norm),
    l2Sum: 1.0,
  };
};
