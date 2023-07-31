import pickBy from 'lodash/pickBy';

import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { getWellColumns } from 'pages/authorized/search/well/getWellColumns';

export const useEnabledWellResultColumnNames = (): string[] => {
  const { data } = useWellConfig();
  const allWellColumns = getWellColumns();

  // get all the settings from the various places that decide what we should be showing
  const disabledFBOColumns = Object.keys(
    pickBy(data?.field_block_operator_filter, (field) => !field?.enabled)
  );

  const disabledFromLocalstorage: string[] = []; // to implement

  const disabledFBOColumnNames = disabledFBOColumns.map(
    translateConfigNameToColumnName
  );

  const disabledColumns = [
    ...disabledFBOColumnNames,
    ...disabledFromLocalstorage,
  ];

  const enabledColumns = Object.keys(allWellColumns).filter(
    (columnName) => !disabledColumns.includes(columnName)
  );

  return enabledColumns;
};

const translateConfigNameToColumnName = (configName: string) => {
  const wellColumns = getWellColumns();

  const columnName = Object.keys(wellColumns).find((columnName) => {
    return wellColumns[columnName].accessor === configName;
  });

  return columnName;
};
