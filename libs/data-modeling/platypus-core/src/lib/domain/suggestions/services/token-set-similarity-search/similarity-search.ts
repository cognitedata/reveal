import { SparseVector } from './types';
import { TopKHeap } from './heap';

interface InvertedListElement {
  vectorId: number;
  j: number; // Zero indexed position in sparse vector
  l2Suffix: number; // Sum of squared values from this position to end of vector
}

export interface SimilaritySearchConstraints {
  similarityThreshold?: number;
  relativeSimilarityThreshold?: number;
  topK?: number;
}

/**
 * Simple index for finding similar vectors by cosine similarity.
 */
export class SimilarityIndex<V extends SparseVector> {
  private indexVectors: V[];
  private invertedLists: InvertedListElement[][];
  private minSimilarity: number;

  /**
   * Create a similarity index from the given vectors.
   * @param vectors Vectors to be indexed. Vectors are assumed to have max length 1.
   * @param dimensions The number of dimensions for the sparse vectors.
   * @param minSimilarity The lowest supported similarity threshold for queries on the index.
   */
  constructor(vectors: V[], dimensions: number, minSimilarity: number) {
    this.indexVectors = vectors;
    this.minSimilarity = minSimilarity;

    // Build inverted lists
    this.invertedLists = [];
    for (let i = 0; i < dimensions; i++) {
      this.invertedLists.push([]);
    }
    vectors.forEach((vector, vectorId) => {
      let l2Suffix = vector.l2Sum;
      let j = 0;
      while (
        l2Suffix >= minSimilarity * minSimilarity &&
        j < vector.indexes.length
      ) {
        const index = vector.indexes[j];
        const value = vector.values[j];
        this.invertedLists[index].push({
          vectorId,
          j,
          l2Suffix,
        });
        l2Suffix -= value * value;
        j += 1;
      }
    });
    // Sort inverted lists on decreasing l2 sum suffix
    for (const invertedLists of this.invertedLists) {
      invertedLists.sort((a, b) => b.l2Suffix - a.l2Suffix);
    }
  }

  search(
    queries: SparseVector[],
    constraints: SimilaritySearchConstraints
  ): { vectors: V[][]; similarities: number[][] } {
    const similarityThreshold = constraints.similarityThreshold || 0.0;
    const relativeSimilarityThreshold =
      constraints.relativeSimilarityThreshold || 0.0;
    const topK = constraints.topK || this.indexVectors.length;

    if (similarityThreshold < this.minSimilarity) {
      throw new RangeError(
        `The index is built to only support similaritythresholds of at least ${this.minSimilarity}, but ${similarityThreshold} was provided.`
      );
    }

    const allIndexVectors: V[][] = [];
    const allSimilarities: number[][] = [];
    for (const query of queries) {
      const { vectors, similarities } = this.searchSingle(
        query,
        similarityThreshold,
        relativeSimilarityThreshold,
        topK
      );
      allIndexVectors.push(vectors);
      allSimilarities.push(similarities);
    }
    return { vectors: allIndexVectors, similarities: allSimilarities };
  }

  private searchSingle(
    queryVector: SparseVector,
    similarityThreshold: number,
    relativeSimilarityThreshold: number,
    topK: number
  ): { vectors: V[]; similarities: number[] } {
    const candidates: TopKHeap = new TopKHeap(topK);
    const alreadyChecked: Set<number> = new Set();

    let querySuffix = queryVector.l2Sum;
    // Similarity threshold we update dynamically as we search when the search constraints let us
    let dynamicThreshold = similarityThreshold;
    for (let i = 0; i < queryVector.indexes.length; i++) {
      if (querySuffix < dynamicThreshold * dynamicThreshold) {
        // Idea: At some point we have looked up so many elements of the query
        // that the remaining elements can't possible be enough for a match
        // above the threshold, so we must already have seen all vectors that
        // could have similarity above threshold.
        // Details: The similarity is bounded by ||query||_2. Since any index
        // vectors not discovered yet can't overlap with query[0..i] the
        // similarity is also bounded by ||query[i..]||_2. So squaring
        // `similarity <= ||query[i..]||_2` yields the above pruning
        // rule that bounds the query suffix.
        break;
      }
      const invertedList = this.invertedLists[queryVector.indexes[i]];
      for (const { vectorId, j, l2Suffix: indexSuffix } of invertedList) {
        if (indexSuffix < (dynamicThreshold * dynamicThreshold) / querySuffix) {
          // Similarly to the query vector bound used to prune above we can
          // also bound the index suffix. Since the index vectors are sorted
          // in decreasing suffix size we can simply stop iterating when we
          // reach the bound.
          break;
        }
        const indexVector = this.indexVectors[vectorId];
        if (!alreadyChecked.has(vectorId)) {
          alreadyChecked.add(vectorId);
          const similarity = cosineSimilarity(
            queryVector,
            indexVector,
            i,
            j,
            querySuffix,
            indexSuffix,
            dynamicThreshold
          );
          if (similarity >= dynamicThreshold) {
            if (relativeSimilarityThreshold * similarity > dynamicThreshold) {
              dynamicThreshold = relativeSimilarityThreshold * similarity;
              while (
                candidates.length > 0 &&
                candidates.peekPriority() < dynamicThreshold
              ) {
                candidates.pop();
              }
            }
            candidates.push(vectorId, similarity);
            if (candidates.length === topK) {
              dynamicThreshold = Math.max(
                dynamicThreshold,
                candidates.peekPriority()
              );
            }
          }
        }
      }
      querySuffix -= queryVector.values[i] * queryVector.values[i];
    }

    const indexVectors = new Array(candidates.length);
    const similarities = new Array(candidates.length);
    for (let i = indexVectors.length - 1; i >= 0; i--) {
      similarities[i] = candidates.peekPriority();
      indexVectors[i] = this.indexVectors[candidates.pop()];
    }

    return {
      vectors: indexVectors,
      similarities,
    };
  }
}

/**
 * Calculate cosine similarity (for normalized vectors).
 * @param a Sparse vector.
 * @param b Sparse vector.
 * @param startPositionA Calculate from this position in a.
 * @param startPositionB Calculate from this position in b.
 * @param suffixA Sum of squared values for a[startPositionA..]
 * @param suffixB Sum of squared values for b[startPositionB..]
 * @param similarityThreshold Minimum similarity. If similarity
 * is below the function might short circuit and return -1.
 * @returns The dot product of a and b.
 */
const cosineSimilarity = (
  a: SparseVector,
  b: SparseVector,
  startPositionA: number,
  startPositionB: number,
  suffixA: number,
  suffixB: number,
  similarityThreshold: number
): number => {
  let dotProduct = 0;
  let i = startPositionA;
  let j = startPositionB;
  while (i < a.indexes.length && j < b.indexes.length) {
    if (
      suffixA * suffixB <
      similarityThreshold * similarityThreshold - dotProduct
    ) {
      return -1.0;
    }
    if (a.indexes[i] === b.indexes[j]) {
      const product = a.values[i] * b.values[j];
      dotProduct += product;
      suffixA -= a.values[i] * a.values[i];
      suffixB -= b.values[j] * b.values[j];
      i++;
      j++;
    } else if (a.indexes[i] < b.indexes[j]) {
      suffixA -= a.values[i] * a.values[i];
      i++;
    } else {
      suffixB -= b.values[j] * b.values[j];
      j++;
    }
  }
  return dotProduct;
};
