/* eslint-disable @typescript-eslint/no-explicit-any */
export type Predicate<T> = (
  value?: T,
  index?: number,
  collection?: T[]
) => boolean;
export type Selector<T, TOut> = (element: T, index: number) => TOut;
export type Aggregator<U, T> = (
  accum: U,
  value?: T,
  index?: number,
  list?: T[]
) => any;
// eslint-disable-next-line
export interface ICollectionGroup<T> {
  [key: string]: T[];
}
