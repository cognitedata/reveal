import { Well } from '@cognite/sdk-wells';

import { getWellboresIdsFromWellsList } from 'modules/wellSearch/utils/getWellboresIdsFromWellsList';

export type ValidQueryObject = { wellboreMatchingId: string };
type QueryProps = { wellboreIds: Set<string> };
type QueryResponse<T> = { data?: T[]; isLoading: boolean };
export type WidgetQuery<T> = (props: QueryProps) => QueryResponse<T>;
interface Props<T extends ValidQueryObject> {
  wells: Well[];
  query: WidgetQuery<T>;
}
export const useDataSourceForDashboard = <T extends ValidQueryObject>({
  query,
  wells,
}: Props<T>) => {
  const { data, ...rest } = query({
    wellboreIds: getWellboresIdsFromWellsList(wells),
  });
  // console.log('Wells', wells);
  // console.log('Total nds events:', data?.length);

  const wellboresWithDataAvailable = new Set();
  data?.forEach((wellbore) => {
    wellboresWithDataAvailable.add(wellbore.wellboreMatchingId);
  });

  return {
    ...rest,
    data: wellboresWithDataAvailable,
  };
};
