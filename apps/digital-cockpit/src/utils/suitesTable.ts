import findIndex from 'lodash/findIndex';
import { Suite } from 'store/suites/types';

// returns new copy of suitesStorage with replaced suites
export const replaceSuites = (
  suitesStorage: Suite[] | null,
  suitesToReplace: Suite[] = []
) => {
  if (!suitesStorage) {
    return suitesStorage;
  }
  const result = [...suitesStorage];
  suitesToReplace.forEach((suite) => {
    const index = findIndex(result, { key: suite.key });
    if (index !== -1) {
      result.splice(index, 1, suite);
    }
  });
  return result;
};

// compares existing suites with new suitesOrder and returns array of changed suites
export const updateSuitesOrder = (
  suites: Suite[],
  suitesOrder: string[]
): Suite[] => {
  const changedSuites: Suite[] = [];
  suites.forEach((suite) => {
    const newOrder = suitesOrder.indexOf(suite.key);
    if (newOrder !== suite.order && newOrder !== -1) {
      changedSuites.push({ ...suite, order: newOrder });
    }
  });
  return changedSuites;
};
