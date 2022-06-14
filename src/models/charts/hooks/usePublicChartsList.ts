import { filter, orderBy } from 'lodash';
import usePlotlyPropsPreview from 'hooks/usePlotlyPropsPreview';
import usePublicCharts from '../queries/usePublicCharts';

interface useMyChartsListProps {
  searchTerm: string;
  order: 'updatedAt' | 'name' | 'owner';
}

const usePublicChartsList = ({ searchTerm, order }: useMyChartsListProps) => {
  const { data = [], isFetched, error } = usePublicCharts();
  usePlotlyPropsPreview(data?.map((c) => c.firebaseChart) ?? []);

  /**
   * Derive filtered list
   */
  const filteredList = searchTerm
    ? filter(data, ({ name, owner, updatedAt }) =>
        [name, owner, updatedAt].some((field) =>
          field.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
        )
      )
    : data;

  /**
   * Derive ordered (and filtered) list
   */
  const orderedList = orderBy(filteredList, [order], ['desc']);

  return {
    list: orderedList,
    loading: !isFetched,
    error,
  };
};

export default usePublicChartsList;
