import { format } from 'date-fns';
import config from './datatransfer.config';

export const getRevisionDateOrString = (revision: string | number) => {
  if (new Date(Number(revision) * 1000).getTime() > 0) {
    return format(new Date(Number(revision) * 1000), 'Pp');
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
