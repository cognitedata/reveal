export enum CHECK_TYPE {
  eq = 'Equal',
  ne = 'Not equal',
  gt = 'Greater than',
  ge = 'Greater than or equal',
  lt = 'Less than',
  le = 'Less than or equal',
}
export enum AGGREGATE_TYPE {
  average = 'Average',
  max = 'Maximum',
  min = 'Minimum',
  count = 'Count',
  sum = 'Sum',
  stepInterpolation = 'Step interpolation',
  interpolation = 'Interpolation',
  totalVariation = 'Total variation',
  continuousVariance = 'Continuous variance',
  discreteVariance = 'Discreet variance',
  latest = 'Latest',
}
