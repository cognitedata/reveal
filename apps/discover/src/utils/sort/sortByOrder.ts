import sortBy from 'lodash/sortBy';

type Sortable = { order?: number | string };
type SortableTypes = Record<string, Sortable> | Sortable[];
// can sort objects or arrays
export const sortByOrder = <T extends SortableTypes>(items: T) => {
  return sortBy(items, 'order');
};
// custom build for array typings
export const sortArrayByOrder = <T extends Sortable[]>(items: T) => {
  return sortBy(items, 'order') as T;
};
