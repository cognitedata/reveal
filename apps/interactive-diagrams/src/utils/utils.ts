import { ids } from 'cogs-variables';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const abbreviateNumber = (n: number) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(1)}K`;
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(1)}M`;
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(1)}B`;
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)}T`;
  return n;
};

export const mapArrayToObj = <T>(key: keyof T, items: T[]) => {
  return items.reduce(
    (acc, cur) => ({ ...acc, [cur[key] as unknown as string]: cur }),
    {}
  );
};

export const getUniqueValuesArray = <T>(arr: T[]): T[] =>
  arr.reduce((accl: T[], item: T) => {
    if (!accl.find((newItem) => isEqual(item, newItem))) accl.push(item);
    return accl;
  }, [] as T[]);

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

export const capitalizeFirstLetter = (input: string) => {
  return `${input.charAt(0).toUpperCase()}${input.substring(1)}`;
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

export const hasOwnProperty = <T extends {}, U extends PropertyKey>(
  obj: T,
  prop: U
): obj is T & Record<U, unknown> => {
  // eslint-disable-next-line no-prototype-builtins
  return obj.hasOwnProperty(prop);
};
