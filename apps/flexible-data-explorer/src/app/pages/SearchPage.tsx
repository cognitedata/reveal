import { Page } from '../containers/page/Page';
import { GenericResults } from '../containers/search/results/GenericResults';
import { ResultsSelection } from '../containers/search/results/ResultsSelection';
import { TimeseriesResults } from '../containers/search/results/TimeseriesResults';
import { useSearchDataTypesQuery } from '../services/dataTypes/queries/useSearchDataTypesQuery';

export const SearchPage = () => {
  const { data: results, isLoading } = useSearchDataTypesQuery();

  return (
    <Page>
      <Page.Header alignActions="left">
        <ResultsSelection />
      </Page.Header>
      <Page.Body loading={isLoading}>
        <GenericResults data={results} />
        <TimeseriesResults />
      </Page.Body>
    </Page>
  );
};
