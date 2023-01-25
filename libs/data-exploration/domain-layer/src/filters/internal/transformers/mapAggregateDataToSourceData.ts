export const mapAggregateDataToSourceData = <T extends object>(
  aggregateData: T[],
  aggregator: string
) => {
  const sources: Set<string | number> = new Set();

  aggregateData.forEach((el) => {
    if (aggregator in el) {
      sources.add((el as any)[aggregator] as string | number);
    }
  });

  return Array.from(sources, (source) => ({
    value: source,
    label: String(source),
  }));
};
