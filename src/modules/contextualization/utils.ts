import moment from 'moment';

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};
export const dateSorter = <A>(select: (x: A) => string) => {
  return function compare(a: A, b: A) {
    return moment(select(a)).diff(select(b));
  };
};

export const truncateString = (value: string, length: number) => {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length)}...`;
};

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText) {
    return true;
  }
  try {
    return (
      value && value.trim().toUpperCase().search(searchText.toUpperCase()) >= 0
    );
  } catch (e) {
    return 'Invalid search term';
  }
};

export const stringContainsAny = (a = '', b: string[] = []) => {
  return b.some((query) => stringContains(a, query));
};

export const getWorkflowIdFromPath = (path: string): string | false => {
  const arrPath = path.split('/');
  const indexOfWorkflow = arrPath.findIndex((item) => item === 'workflow');
  const numberRegex = /^[0-9]*$/;

  if (
    arrPath[indexOfWorkflow + 1] &&
    numberRegex.test(arrPath[indexOfWorkflow + 1])
  ) {
    return arrPath[indexOfWorkflow + 1];
  }
  return false;
};
