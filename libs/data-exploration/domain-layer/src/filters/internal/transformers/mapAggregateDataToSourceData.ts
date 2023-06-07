import get from 'lodash/get';

export const mapAggregateDataToSourceData = <T extends object>(
  aggregateData: T[],
  aggregator: string
) => {
  const sources: Set<string> = new Set();

  aggregateData.forEach((el) => {
    if (aggregator in el) {
      sources.add(get(el, aggregator));
    }
  });

  return Array.from(sources, (source) => ({
    value: source,
    label: String(source),
  }));
};
