import capitalize from 'lodash/capitalize';
import configurationsConfig from 'configs/configurations.config';
import dataTransfersConfig from 'configs/datatransfer.config';

export const getMappedColumnName = (
  colName: string,
  page: 'configurations' | 'datatransfers' = 'datatransfers'
) => {
  let mapped = null;
  if (page === 'datatransfers') {
    mapped = dataTransfersConfig.columnNameMapping.find(
      (item) => item.keyName === colName
    );
  } else if (page === 'configurations') {
    mapped = configurationsConfig.columnNameMapping.find(
      (item) => item.keyName === colName
    );
  }
  if (mapped) {
    return mapped.value;
  }

  return capitalize(colName);
};
