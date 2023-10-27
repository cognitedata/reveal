import { InfiniteData } from '@tanstack/react-query';

type Items<T> = {
  items: T[];
};
export const collectPages = <T>(
  data: InfiniteData<Items<T>> | undefined
): T[] =>
  data
    ? data.pages.reduce(
        (accumulator: T[], page) => [...accumulator, ...page.items],
        []
      )
    : [];
