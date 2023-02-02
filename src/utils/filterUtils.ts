import { notification } from 'antd';
import isString from 'lodash/isString';
import { DataSetWithExtpipes } from 'actions';
import { useTranslation } from 'common/i18n';
import { GovernanceStatus } from 'components/table-filters';

export const useHandleFilters = () => {
  const { t } = useTranslation();

  const handleGovernanceFilter = (
    governanceFilter: GovernanceStatus[],
    dataSetsList: DataSetWithExtpipes[]
  ) => {
    let filteredDataSetsList: DataSetWithExtpipes[] = [];
    if (!governanceFilter.length) {
      filteredDataSetsList = dataSetsList;
    } else {
      if (governanceFilter.includes('governed')) {
        filteredDataSetsList = filteredDataSetsList.concat(
          dataSetsList.filter(
            (set) => set.dataSet.metadata.consoleGoverned === true
          )
        );
      }
      if (governanceFilter.includes('ungoverned')) {
        filteredDataSetsList = filteredDataSetsList.concat(
          dataSetsList.filter(
            (set) => set.dataSet.metadata.consoleGoverned === false
          )
        );
      }
      if (governanceFilter.includes('not-defined')) {
        filteredDataSetsList = filteredDataSetsList.concat(
          dataSetsList.filter(
            (set) => set.dataSet.metadata.consoleGoverned === undefined
          )
        );
      }
    }
    return filteredDataSetsList;
  };

  const handleDataSetsSearch = (
    searchValue: string | RegExp,
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
        notification.error({ message: t('invalid-search-value') });
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

  const handleDataSetsFilters = (
    showArchived: boolean,
    searchValue: string | RegExp = '',
    governanceFilter: GovernanceStatus[] = [],
    dataSets: DataSetWithExtpipes[]
  ) => {
    const archiveDataSets = handleArchivedFilter(showArchived, dataSets);
    const searchDataSets = handleDataSetsSearch(searchValue, archiveDataSets);
    const filteredDataSets = handleGovernanceFilter(
      governanceFilter,
      searchDataSets
    );

    return filteredDataSets;
  };

  return { handleDataSetsFilters };
};
