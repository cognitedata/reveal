/**
 * Tests if a set of numbers is uniformly distributed using multiple statistical methods
 */
export type UniformDistributionResult = {
  isUniform: boolean;
  chiSquaredPValue: number;
  kolmogorovSmirnovStatistic: number;
  meanDeviation: number;
  standardDeviation: number;
  confidence: number; // 0-1, higher means more confident in the result
};

/**
 * Tests if a set of numbers is uniformly distributed
 * @param values - Array of numbers to test (should be normalized to 0-1 range)
 * @param bins - Number of bins for chi-squared test (default: 10)
 * @param alpha - Significance level for statistical tests (default: 0.05)
 * @returns Test results indicating if the distribution is uniform
 */
export function testUniformDistribution(
  values: number[],
  bins: number = 10,
  alpha: number = 0.05
): UniformDistributionResult {
  if (values.length === 0) {
    throw new Error('Cannot test empty array');
  }

  // Normalize values to [0, 1] range if not already
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const normalizedValues = range === 0 ? values : values.map((v) => (v - min) / range);

  // 1. Chi-squared goodness of fit test
  const chiSquaredResult = chiSquaredTest(normalizedValues, bins);

  // 2. Kolmogorov-Smirnov test
  const ksStatistic = kolmogorovSmirnovTest(normalizedValues);

  // 3. Calculate mean and standard deviation
  const mean = normalizedValues.reduce((sum, v) => sum + v, 0) / normalizedValues.length;
  const variance =
    normalizedValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / normalizedValues.length;
  const stdDev = Math.sqrt(variance);

  // Expected mean for uniform distribution [0,1] is 0.5
  const meanDeviation = Math.abs(mean - 0.5);

  // Expected standard deviation for uniform distribution [0,1] is sqrt(1/12) ≈ 0.289
  const expectedStdDev = Math.sqrt(1 / 12);
  const stdDevDeviation = Math.abs(stdDev - expectedStdDev);

  // 4. Combine results to determine if uniform
  const chiSquaredPassed = chiSquaredResult.pValue > alpha;
  const ksPassed = ksStatistic < getKSCriticalValue(normalizedValues.length, alpha);
  const meanPassed = meanDeviation < 0.1; // Allow 10% deviation from expected mean
  const stdDevPassed = stdDevDeviation < 0.1; // Allow reasonable deviation from expected std dev

  // Calculate confidence based on how well all tests agree
  const passedTests = [chiSquaredPassed, ksPassed, meanPassed, stdDevPassed].filter(Boolean).length;
  const confidence = passedTests / 4;

  const isUniform = passedTests >= 3; // Majority of tests must pass

  return {
    isUniform,
    chiSquaredPValue: chiSquaredResult.pValue,
    kolmogorovSmirnovStatistic: ksStatistic,
    meanDeviation,
    standardDeviation: stdDev,
    confidence
  };
}

/**
 * Performs chi-squared goodness of fit test for uniform distribution
 */
function chiSquaredTest(values: number[], bins: number): { statistic: number; pValue: number } {
  const n = values.length;
  const expected = n / bins;
  const binCounts = new Array(bins).fill(0);

  // Count values in each bin
  for (const value of values) {
    const binIndex = Math.min(Math.floor(value * bins), bins - 1);
    binCounts[binIndex]++;
  }

  // Calculate chi-squared statistic
  let chiSquared = 0;
  for (const observed of binCounts) {
    chiSquared += Math.pow(observed - expected, 2) / expected;
  }

  // Calculate p-value using chi-squared distribution
  const degreesOfFreedom = bins - 1;
  const pValue = 1 - chiSquaredCDF(chiSquared, degreesOfFreedom);

  return { statistic: chiSquared, pValue };
}

/**
 * Performs Kolmogorov-Smirnov test for uniform distribution
 */
function kolmogorovSmirnovTest(values: number[]): number {
  const n = values.length;
  const sortedValues = [...values].sort((a, b) => a - b);

  let maxDifference = 0;

  for (let i = 0; i < n; i++) {
    const empiricalCDF = (i + 1) / n;
    const theoreticalCDF = sortedValues[i]; // For uniform [0,1], CDF = x
    const difference = Math.abs(empiricalCDF - theoreticalCDF);
    maxDifference = Math.max(maxDifference, difference);
  }

  return maxDifference;
}

/**
 * Approximation of chi-squared cumulative distribution function
 */
function chiSquaredCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df === 1) return 2 * normalCDF(Math.sqrt(x)) - 1;
  if (df === 2) return 1 - Math.exp(-x / 2);

  // Approximation for other degrees of freedom using normal approximation
  const mean = df;
  const variance = 2 * df;
  const normalizedX = (x - mean) / Math.sqrt(variance);
  return normalCDF(normalizedX);
}

/**
 * Approximation of normal cumulative distribution function
 */
function normalCDF(x: number): number {
  // Abramowitz and Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let prob =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  if (x > 0) {
    prob = 1 - prob;
  }

  return prob;
}

/**
 * Get critical value for Kolmogorov-Smirnov test
 */
function getKSCriticalValue(n: number, alpha: number): number {
  // Approximate critical values for common significance levels
  if (alpha === 0.05) {
    return 1.36 / Math.sqrt(n);
  } else if (alpha === 0.01) {
    return 1.63 / Math.sqrt(n);
  } else {
    // General approximation
    return Math.sqrt(-0.5 * Math.log(alpha / 2)) / Math.sqrt(n);
  }
}

/**
 * Convenience function to test if an array of any numbers is uniformly distributed
 * (automatically normalizes the input)
 */
export function isUniformlyDistributed(values: number[], confidence: number = 0.75): boolean {
  const result = testUniformDistribution(values);
  return result.isUniform && result.confidence >= confidence;
}
