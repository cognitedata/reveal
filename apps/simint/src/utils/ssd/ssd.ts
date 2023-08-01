import type { LogicalCheck } from '@cognite/simconfig-api-sdk/rtk';

import { constrain, getLineSlope, mean, standardDeviation } from './mathUtils';
import { Timeseries } from './timeseries';

/**
 * Partial sums for empirical CDF (formula (2.1) from Section 2.1 "Model" in [Haynes2017])
 * @param {number[]} data data array.
 * @param {number} k number of quantiles.
 * @returns {number[][]} partial sums.
 */
function getPartialSums(data: number[], k: number): number[][] {
  const tolerance = 1e-5;
  const n = data.length;
  const partialSums = new Array<number[]>(k);
  const sortedData = [...data].sort((a, b) => a - b);

  for (let i = 0; i < k; i++) {
    const z = -1 + (2 * i + 1.0) / k; // Values from (-1+1/k) to (1-1/k) with step = 2/k
    const p = 1.0 / (1 + (2 * n - 1) ** -z); // Values from 0.0 to 1.0
    const t = sortedData[Math.trunc((n - 1) * p)]; // Quantile value, formula (2.1) in [Haynes2017]

    partialSums[i] = new Array<number>(n + 1).fill(0);
    for (let tau = 1; tau <= n; tau++) {
      partialSums[i][tau] = partialSums[i][tau - 1];
      if (data[tau - 1] < t) {
        partialSums[i][tau] += 2;
      } // We use doubled value (2) instead of original 1.0
      if (Math.abs(data[tau - 1] - t) < tolerance) {
        partialSums[i][tau] += 1;
      } // We use doubled value (1) instead of original 0.5
    }
  }
  return partialSums;
}

/**
 * Calculates the cost of the (tau1; tau2] segment.
 * @param {number[][]} partialSums Partial sums for empirical CDF
 * @param {number} tau1 The start index of the segment.
 * @param {number} tau2 The end index of the segment.
 * @param {number} k Number of quantiles.
 * @param {number} n Number of elements in the data set.
 * @returns {number} The cost of the segment.
 */
function getSegmentCost(
  partialSums: number[][],
  tau1: number,
  tau2: number,
  k: number,
  n: number
): number {
  let sum = 0;
  for (let i = 0; i < k; i++) {
    // actualSum is (count(data[j] < t) * 2 + count(data[j] === t) * 1) for j=tau1..tau2-1
    const actualSum = partialSums[i][tau2] - partialSums[i][tau1];

    // We skip these two cases (correspond to fit = 0 or fit = 1) because of invalid Math.log values
    if (actualSum !== 0 && actualSum !== (tau2 - tau1) * 2) {
      // Empirical CDF $\hat{F}_i(t)$ (Section 2.1 "Model" in [Haynes2017])
      const fit = (actualSum * 0.5) / (tau2 - tau1);
      // Segment cost $\mathcal{L}_{np}$ (Section 2.2 "Nonparametric maximum likelihood" in [Haynes2017])
      const lnp =
        (tau2 - tau1) * (fit * Math.log(fit) + (1 - fit) * Math.log(1 - fit));
      sum += lnp;
    }
  }
  const c = -Math.log(2 * n - 1); // Constant from Lemma 3.1 in [Haynes2017]
  return ((2.0 * c) / k) * sum; // See Section 3.1 "Discrete approximation" in [Haynes2017]
}

/**
 * Returns the index of the minimum element.
 * In case if there are several minimum elements in the given list, the index of the first one will be returned.
 * @param {number[]} values List of values to find the minimum element.
 * @throws {Error} If the input array is empty.
 * @returns {number} Index of the minimum element.
 */
function whichMin(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Input data should contain elements');
  }

  return values.indexOf(Math.min(...values));
}

const logicalChecks: Record<
  Required<LogicalCheck>['check'],
  (value: number, threshold: number) => boolean
> = {
  eq: (value, threshold) => value === threshold,
  ne: (value, threshold) => value !== threshold,
  gt: (value, threshold) => value > threshold,
  ge: (value, threshold) => value >= threshold,
  lt: (value, threshold) => value < threshold,
  le: (value, threshold) => value <= threshold,
};

/**
 * Executes a logical check for the given time series.
 * @param {Timeseries} ts The Timeseries to evaluate.
 * @param {number} threshold The threshold to use for the logical check.
 * @param {string} check The logical check to use.
 * @returns {Timeseries} Timeseries with the logical check status (0: conditions not met, 1: conditions met) for all
 * timestamps.
 * @throws {Error} If the provided check is not supported.
 */
export function logicalCheck(
  ts: Timeseries,
  threshold: number,
  check: Required<LogicalCheck>['check']
): Timeseries {
  // resamples the given Timeseries so that it contains equally spaced elements
  const resampledTs = ts.getEquallySpacedResampled();

  // store locally the x and y arrays
  const x = resampledTs.time;
  const y = resampledTs.data;

  const yResult = y.map((value) => {
    if (!(check in logicalChecks)) {
      throw new Error('Invalid logical check');
    }
    return +logicalChecks[check](value, threshold);
  });

  return new Timeseries(x, yResult, ts.granularity, false);
}

/**
 * Steady State Detection (based on Change Point Detection).
 * Evaluates the given time series with respect to steady behavior. First the Timeseries is split into "statistically
 * homogeneous" segments using the ED Pelt change point detection algorithm. Then each segment is tested with regards to
 * a normalized standard deviation and the slope of the line of best fit to determine if the segment can be considered a
 * steady or transient region.
 * @param {Timeseries} ts The Timeseries to evaluate.
 * @param {number} minDistance Minimum segment distance. Specifies the minimum distance for each segment that will be
 * considered in the Change Point Detection algorithm.
 * @param {number} varThreshold Variance threshold. Specifies the variance threshold.If the normalized variance
 * calculated for a given segment is greater than the threshold, the segment will be labeled as transient (value = 0).
 * @param {number} slopeThreshold Slope threshold. Specifies the slope threshold. If the slope of a line fitted to the
 * data of a given segment is greater than 10 to the power of the threshold value, the segment will be labeled as
 * transient (value = 0).
 * @returns {Timeseries} Timeseries with the steady state condition (0: transient region, 1: steady region) for all
 * timestamps.
 */
export function steadyStateDetection(
  ts: Timeseries,
  minDistance: number,
  varThreshold: number,
  slopeThreshold: number
): Timeseries {
  // resamples the given Timeseries so that it contains equally spaced elements
  const resampledTs = ts.getEquallySpacedResampled();

  // store locally the x and y arrays
  const [x, y] = [resampledTs.time, resampledTs.data];

  // the maximum allowable distance is half the number of datapoints so we override the minDistance value if
  // the current value is not valid
  const maxDistance = Math.floor(x.length / 2);
  const minDistanceConstrained =
    minDistance > maxDistance ? maxDistance : minDistance;

  // instantiate the array that will store the results
  const ssMap = new Array<number>(x.length);

  // compute the change points
  const changePoints = edPelt(y, minDistanceConstrained);

  // Add zero and the last index to the List
  changePoints.push(0);
  changePoints.push(x.length);
  // Sort the changePoints in ascending order
  changePoints.sort((a, b) => a - b);

  // compute the mean value of the input vector
  const avg = mean(y);

  // constrains the mean of the data into predefined limits
  // this will prevent generating infinite values on the var calculation below
  const divisor = constrain(avg, 1.0e-4, 1.0e6);

  for (let i = 1; i < changePoints.length; i++) {
    const i0 = changePoints[i - 1];
    const i1 = changePoints[i];
    const xi = x.slice(i0, i1 + 1);
    const yi = y.slice(i0, i1 + 1);

    const std = standardDeviation(yi) / (i1 - i0);
    const stdNormalised = (1.0e5 * std) / divisor;

    // We consider a region as transient unless it passed the subsequent logical tests
    let ssRegion = 0.0;

    // First check if the variance criteria is met
    if (Math.abs(stdNormalised) < varThreshold) {
      // Only fit a line if the first criteria is met
      const slope = getLineSlope(xi, yi);

      if (Math.abs(slope) < 10.0 ** slopeThreshold) {
        ssRegion = 1.0;
      }
    }

    // Assigns the Steady State map flag to all timestamps of the current region
    for (let j = i0; j < i1; j++) {
      ssMap[j] = ssRegion;
    }
  }
  return new Timeseries(x, ssMap, ts.granularity, false);
}

/**
 * The ED-PELT algorithm for changepoint detection.
 * For given array of `numbers`, detects locations of change points that splits original series of values into
 * "statistically homogeneous" segments. Such points correspond to moments when statistical properties of the
 * distribution are changing. This method supports nonparametric distributions and has O(N*log(N)) algorithmic
 * complexity.
 * @param {number[]} data An array with sensor values.
 * @param {number = 1} minDistance Minimum distance between changepoints. Defaults to 1.
 * @throws {Error} If min_distance argument is not a value between 1 and data.length.
 * @returns {number[]} Returns an array with 1-based indexes of changepoint. Changepoints correspond to the end of the
 * detected segments.
 * @remarks
 * References:
 * 1. [Haynes2017] Haynes, Kaylea, Paul Fearnhead, and Idris A. Eckley. "A computationally efficient nonparametric
 * approach for changepoint detection." Statistics and Computing 27, no. 5 (2017): 1293-1305.
 * https://doi.org/10.1007/s11222-016-9687-5
 *
 * 2. [Killick2012] Killick, Rebecca, Paul Fearnhead, and Idris A. Eckley. "Optimal detection of changepoints with
 * a linear computational cost." Journal of the American Statistical Association 107, no. 500 (2012): 1590-1598.
 * https://arxiv.org/pdf/1101.1438.pdf
 *
 * Based on the ED-Pelt C# implementation from (c) 2019 Andrey Akinshin
 * Licensed under The MIT License https://opensource.org/licenses/MIT
 */
export function edPelt(data: number[], minDistance = 1): number[] {
  // We will use `n` as the number of elements in the `data` array
  const n = data.length;

  // checking corner cases
  if (n <= 2) {
    return [];
  }
  if (minDistance < 1 || minDistance > n) {
    throw new Error('minDistance should be in range from 1 to data.length');
  }

  // The penalty which we add to the final cost for each additional changepoint
  // Here we use the Modified Bayesian Information Criterion
  const penalty = 3 * Math.log(n);

  // `k` is the number of quantiles that we use to approximate an integral during the segment cost evaluation
  // We use `k=Ceiling(4*log(n))` as suggested in the Section 4.3 "Choice of K in ED-PELT" in [Haynes2017]
  // `k` can't be greater than `n`, so we should always use the `Min` function here (important for n <= 8)
  const k = Math.min(n, Math.ceil(4 * Math.log(n)));

  // We should precalculate sums for empirical CDF, it will allow fast evaluating of the segment cost
  const partialSums = getPartialSums(data, k);

  // Since we use the same values of `partialSums`, `k`, `n` all the time,
  // we introduce a shortcut `Cost(tau1, tau2)` for segment cost evaluation.
  // Hereinafter, we use `tau` to name variables that are changepoint candidates.
  const cost = (tau1: number, tau2: number) =>
    getSegmentCost(partialSums, tau1, tau2, k, n);

  // We will use dynamic programming to find the best solution; `bestCost` is the cost array.
  // `bestCost[i]` is the cost for subarray `data[0..i-1]`.
  // It's a 1-based array (`data[0]`..`data[n-1]` correspond to `bestCost[1]`..`bestCost[n]`)
  const bestCost = new Array<number>(n + 1);
  bestCost[0] = -penalty;
  for (
    let currentTau = minDistance;
    currentTau < 2 * minDistance;
    currentTau++
  ) {
    bestCost[currentTau] = cost(0, currentTau);
  }

  // `previousChangePointIndex` is an array of references to previous changepoints. If the current segment
  // ends at the position `i`, the previous segment ends at the position `previousChangePointIndex[i]`. It's a
  // 1-based array (`data[0]`..`data[n-1]` correspond to the `previousChangePointIndex[1]`..
  // `previousChangePointIndex[n]`)
  const previousChangePointIndex = new Array<number>(n + 1).fill(0);

  // We use PELT (Pruned Exact Linear Time) approach which means that instead of enumerating all possible
  // previous tau values, we use a whitelist of "good" tau values that can be used in the optimal solution. If
  // we are 100% sure that some of the tau values will not help us to form the optimal solution, such values
  // should be removed. See [Killick2012] for details.
  const previousTaus = [0, minDistance];

  // Following the dynamic programming approach, we enumerate all tau positions. For each `currentTau`, we
  // pretend that it's the end of the last segment and trying to find the end of the previous segment.
  // for (int currentTau = 2 * minDistance; currentTau < n + 1; currentTau++)
  for (let currentTau = 2 * minDistance; currentTau < n + 1; currentTau++) {
    // For each previous tau, we should calculate the cost of taking this tau as the end of the previous
    // segment. This cost equals the cost for the `previousTau` plus cost of the new segment (from
    // `previousTau` to `currentTau`) plus penalty for the new changepoint.
    const costForPreviousTau: number[] = [];
    previousTaus.forEach((previousTau) => {
      costForPreviousTau.push(
        bestCost[previousTau] + cost(previousTau, currentTau) + penalty
      );
    });

    // Now we should choose the tau that provides the minimum possible cost.
    const bestPreviousTauIndex = whichMin(costForPreviousTau);
    bestCost[currentTau] = costForPreviousTau[bestPreviousTauIndex];
    previousChangePointIndex[currentTau] = previousTaus[bestPreviousTauIndex];

    // Prune phase: we remove "useless" tau values that will not help to achieve minimum cost in the future
    const currentBestCost = bestCost[currentTau];
    let newPreviousTausSize = 0;
    previousTaus.forEach((_previousTau, index) => {
      if (costForPreviousTau[index] < currentBestCost + penalty) {
        previousTaus[newPreviousTausSize] = previousTaus[index];
        newPreviousTausSize += 1;
      }
    });
    previousTaus.splice(
      newPreviousTausSize,
      previousTaus.length - newPreviousTausSize
    );

    // We add a new tau value that is located on the `minDistance` distance from the next `currentTau` value
    previousTaus.push(currentTau - (minDistance - 1));
  }

  // Here we collect the result list of changepoint indexes `changePointIndexes` using
  // `previousChangePointIndex`
  const changePointIndexes = [];
  let currentIndex = previousChangePointIndex[n]; // The index of the end of the last segment is `n`
  while (currentIndex !== 0) {
    changePointIndexes.push(currentIndex);
    currentIndex = previousChangePointIndex[currentIndex];
  }
  // Add zero and the last index to the List
  // changePointIndexes.push(0);
  // changePointIndexes.push(data.length - 1);

  // Sort the changePointIndexes in ascending order
  const result = changePointIndexes.slice();
  result.sort((a, b) => a - b);

  return result;
}
