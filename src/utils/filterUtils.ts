import { notification } from 'antd';
import isString from 'lodash/isString';
import { DataSetWithExtpipes } from 'actions';

const handleGovernanceFilter = (
  qualityFilter: string,
  dataSetsList: DataSetWithExtpipes[]
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
  dataSetsList: DataSetWithExtpipes[]
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
          (set.extpipes &&
            Array.isArray(set.extpipes) &&
            set.extpipes.some(
              (extpipe) =>
                extpipe.name?.match(searchRegex) ||
                extpipe.externalId?.match(searchRegex)
            ))
      );
    } catch (e) {
      notification.error({ message: 'Invalid search value' });
      setSearchValue('');
      return dataSetsList;
    }
  }
  return dataSetsList;
};

const handleArchivedFilter = (
  showArchived: boolean,
  dataSets: DataSetWithExtpipes[]
) => {
  let dataSetsList: DataSetWithExtpipes[];
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
  dataSets: DataSetWithExtpipes[]
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
