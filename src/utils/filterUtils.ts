import message from 'antd/lib/message';
import isString from 'lodash/isString';
import { DataSet } from './types';

const handleGovernanceFilter = (
  qualityFilter: string,
  dataSetsList: DataSet[]
) => {
  if (qualityFilter === 'governed') {
    return dataSetsList.filter((set) => set.metadata.consoleGoverned === true);
  }
  if (qualityFilter === 'ungoverned') {
    return dataSetsList.filter((set) => set.metadata.consoleGoverned === false);
  }
  return dataSetsList;
};

const handleDataSetsSearch = (
  searchValue: string | RegExp,
  setSearchValue: (arg0: string) => void,
  dataSetsList: DataSet[]
) => {
  if (searchValue !== '') {
    try {
      const searchRegex = new RegExp(searchValue, 'gi');
      return dataSetsList.filter(
        (set: DataSet) =>
          set.name?.match(searchRegex) ||
          set.description?.match(searchRegex) ||
          (Array.isArray(set.metadata.consoleLabels) &&
            set.metadata.consoleLabels.some(
              (label) => isString(label) && label.match(searchRegex)
            )) ||
          (set.metadata.integrations &&
            Array.isArray(set.metadata.integrations) &&
            set.metadata.integrations.some(
              (integration) =>
                integration.name?.match(searchRegex) ||
                integration.externalId?.match(searchRegex)
            ))
      );
    } catch (e) {
      message.error('Invalid search value');
      setSearchValue('');
      return dataSetsList;
    }
  }
  return dataSetsList;
};

const handleArchivedFilter = (showArchived: boolean, dataSets: any[]) => {
  let dataSetsList: DataSet[];
  if (showArchived) {
    dataSetsList = dataSets;
  } else {
    dataSetsList = dataSets.filter(
      (set: { metadata: { archived: boolean } }) =>
        set.metadata.archived !== true
    );
  }
  return dataSetsList;
};

export const handleDataSetsFilters = (
  showArchived: boolean,
  searchValue: string | RegExp,
  setSearchValue: (arg0: string) => void,
  qualityFilter: string,
  dataSets: any[]
) => {
  const archiveDataSets = handleArchivedFilter(showArchived, dataSets);
  const searchDataSets = handleDataSetsSearch(
    searchValue,
    setSearchValue,
    archiveDataSets
  );
  const filteredDataSets = handleGovernanceFilter(
    qualityFilter,
    searchDataSets
  );

  return filteredDataSets;
};
