import message from 'antd/lib/message';
import isString from 'lodash/isString';
import { DataSetWithIntegrations } from 'actions';

const handleGovernanceFilter = (
  qualityFilter: string,
  dataSetsList: DataSetWithIntegrations[]
) => {
  if (qualityFilter === 'governed') {
    return dataSetsList.filter(
      (set) => set.dataSet.metadata.consoleGoverned === true
    );
  }
  if (qualityFilter === 'ungoverned') {
    return dataSetsList.filter(
      (set) => set.dataSet.metadata.consoleGoverned === false
    );
  }
  return dataSetsList;
};

const handleDataSetsSearch = (
  searchValue: string | RegExp,
  setSearchValue: (arg0: string) => void,
  dataSetsList: DataSetWithIntegrations[]
) => {
  if (searchValue !== '') {
    try {
      const searchRegex = new RegExp(searchValue, 'gi');
      return dataSetsList.filter(
        (set) =>
          set.dataSet.name?.match(searchRegex) ||
          set.dataSet.description?.match(searchRegex) ||
          (set.dataSet.metadata.consoleLabels &&
            Array.isArray(set.dataSet.metadata.consoleLabels) &&
            set.dataSet.metadata.consoleLabels.some(
              (label) => isString(label) && label.match(searchRegex)
            )) ||
          (set.integrations &&
            Array.isArray(set.integrations) &&
            set.integrations.some(
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

const handleArchivedFilter = (
  showArchived: boolean,
  dataSets: DataSetWithIntegrations[]
) => {
  let dataSetsList: DataSetWithIntegrations[];
  if (showArchived) {
    dataSetsList = dataSets;
  } else {
    dataSetsList = dataSets.filter((set) => !set.dataSet.metadata.archived);
  }
  return dataSetsList;
};

export const handleDataSetsFilters = (
  showArchived: boolean,
  searchValue: string | RegExp,
  setSearchValue: (arg0: string) => void,
  qualityFilter: string,
  dataSets: DataSetWithIntegrations[]
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
