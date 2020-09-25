import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import config from './datatransfer.config';

export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR).getTime() > 0) {
    return format(new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR), 'Pp');
  }
  return revision;
};

export const getMappedColumnName = (colName: string) => {
  const mapped = config.columnNameMapping.find(
    (item) => item.keyName === colName
  );
  if (mapped) {
    return mapped.value;
  }
  return colName;
};
