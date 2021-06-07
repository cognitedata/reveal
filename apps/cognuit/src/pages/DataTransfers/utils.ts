import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import dataTransfersConfig from './datatransfer.config';
import configurationsConfig from '../Configurations/configurations.config';

export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR).getTime() > 0) {
    return format(new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR), 'Pp');
  }
  return revision;
};

export const getMappedColumnName = (
  colName: string,
  page: string = 'datatransfers'
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
  return colName;
};
