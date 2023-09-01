import { filter, orderBy } from 'lodash';

import usePublicCharts from '../queries/usePublicCharts';

interface useMyChartsListProps {
  searchTerm: string;
  property: 'updatedAt' | 'name' | 'owner';
  order?: 'asc' | 'desc';
}

const usePublicChartsList = ({
  searchTerm,
  property,
  order = 'desc',
}: useMyChartsListProps) => {
  const { data = [], isFetched, error } = usePublicCharts();

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
  const orderedList = orderBy(filteredList, [property], [order]);

  return {
    list: orderedList,
    loading: !isFetched,
    error,
  };
};

export default usePublicChartsList;
