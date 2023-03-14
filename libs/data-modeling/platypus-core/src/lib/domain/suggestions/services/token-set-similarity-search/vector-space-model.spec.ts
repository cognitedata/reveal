import {
  countDocumentFrequencies,
  createQgramTokenizer,
  createTfidfVectorSpaceModel,
  createVocabulary,
} from './vector-space-model';

describe('createQgramTokenizer', () => {
  it('should work', () => {
    const tokenizer = createQgramTokenizer(2);
    const tokens = tokenizer('abc');
    expect(tokens).toStrictEqual(['ab', 'bc']);
  });
  it('should pad strings', () => {
    const tokenizer = createQgramTokenizer(2, '#');
    const tokens = tokenizer('abc');
    expect(tokens).toStrictEqual(['#a', 'ab', 'bc', 'c#']);
  });
});

describe('countDocumentFrequencies', () => {
  it('should work', () => {
    const tokenizer = (s: string) => s.split(' ');
    const documentFrequencies = countDocumentFrequencies(
      ['foo bar foo', 'woo wii bar', 'bar foo woo'],
      tokenizer
    );
    expect(Object.fromEntries(documentFrequencies.entries())).toStrictEqual({
      foo: 2,
      bar: 3,
      woo: 2,
      wii: 1,
    });
  });
});

describe('createVocabulary', () => {
  it('should work', () => {
    const documentFrequencies = new Map([
      ['foo', 2],
      ['bar', 1],
      ['a', 10],
      ['b', 5],
    ]);
    const vocbulary = createVocabulary(documentFrequencies);
    expect(Object.fromEntries(vocbulary.entries())).toStrictEqual({
      foo: 1,
      bar: 0,
      a: 3,
      b: 2,
    });
  });
});

const tfidf = ({
  tf,
  df,
  numberOfDocuments,
}: {
  tf: number;
  df: number;
  numberOfDocuments: number;
}): number =>
  Math.log2(tf + 1.0) * Math.log2((numberOfDocuments + 1) / (df + 1));

const normalizeVector = (vector: number[]): number[] => {
  let l2Sum = 0.0;
  vector.forEach((v) => (l2Sum += v * v));

  const length = Math.sqrt(l2Sum);

  const normalized = vector.slice();
  for (let i = 0; i < vector.length; i++) {
    normalized[i] /= length;
  }
  return normalized;
};

describe('createTfidfVectorSpaceModel', () => {
  it('should work', () => {
    const tokenizer = (s: string) => s.split(' ');
    const vocabulary = new Map([
      ['b', 0],
      ['woo', 1],
      ['bar', 2],
    ]);
    const documentFrequencies = new Map([
      ['foo', 2],
      ['bar', 1],
      ['a', 10],
      ['b', 5],
    ]);
    const numberOfDocuments = 15;
    const vsm = createTfidfVectorSpaceModel(
      tokenizer,
      vocabulary,
      documentFrequencies,
      numberOfDocuments
    );
    const vector = vsm('a woo bar a a bar');

    const fullVector = normalizeVector([
      tfidf({ tf: 1, df: 0, numberOfDocuments }), // woo
      tfidf({ tf: 2, df: 1, numberOfDocuments }), // bar
      tfidf({ tf: 3, df: 10, numberOfDocuments }), // a
    ]);

    expect(vector.indexes).toStrictEqual([1, 2]);
    expect(vector.values).toHaveLength(2);
    expect(vector.values[0]).toBeCloseTo(fullVector[0], 6); // woo
    expect(vector.values[1]).toBeCloseTo(fullVector[1], 6); // bar
    expect(vector.l2Sum).toBeCloseTo(
      fullVector[0] * fullVector[0] + fullVector[1] * fullVector[1],
      6
    );
  });

  it('should provide unit length vectors with only in-vocabulary tokens', () => {
    const tokenizer = (s: string) => s.split(' ');
    const vocabulary = new Map([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
    const documentFrequencies = new Map([
      ['a', 2],
      ['b', 4],
      ['c', 6],
    ]);
    const numberOfDocuments = 15;
    const vsm = createTfidfVectorSpaceModel(
      tokenizer,
      vocabulary,
      documentFrequencies,
      numberOfDocuments
    );
    const vector = vsm('a b c b a c b b');

    let l2Sum = 0.0;
    vector.values.forEach((v) => (l2Sum += v * v));

    expect(l2Sum).toBeCloseTo(1.0, 6);
    expect(vector.l2Sum).toBeCloseTo(l2Sum);
  });
});
