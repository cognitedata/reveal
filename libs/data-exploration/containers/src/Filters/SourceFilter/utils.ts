import get from 'lodash/get';

export const extractSources = <T>(items: T[]) => {
  const sources: Set<string> = new Set();

  items.forEach((item) => {
    const source = get(item, 'source');

    if (source) {
      sources.add(String(source));
    }
  });

  return Array.from(sources);
};
