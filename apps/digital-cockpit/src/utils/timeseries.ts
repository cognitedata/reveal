export const calculateGranularity = (
  domain: number[],
  pointsPerSeries = 1000
) => {
  const timeDifferenceSeconds = (domain[1] - domain[0]) / 1000;
  const targetGranularitySeconds = Math.ceil(
    timeDifferenceSeconds / pointsPerSeries
  );
  const targetGranularityMinutes = Math.ceil(targetGranularitySeconds / 60);
  const targetGranularityHours = Math.ceil(targetGranularityMinutes / 60);
  const targetGranularityDays = Math.ceil(targetGranularityHours / 24);

  // Seconds
  if (targetGranularitySeconds <= 60) {
    return `${targetGranularitySeconds}s`;
  }
  // Minutes
  if (targetGranularityMinutes <= 60) {
    return `${targetGranularityMinutes}m`;
  }
  // Hours
  if (targetGranularityHours <= 24) {
    return `${targetGranularityHours}h`;
  }
  // Days
  if (targetGranularityDays <= 100) {
    return `${targetGranularityDays}d`;
  }

  return '100d';
};
