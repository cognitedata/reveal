import SourceTable from 'components/SourceTable/SourceTable';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';
import { useComponentTranslations } from 'hooks/translations';
import { calculationSummaries } from 'models/calculation-backend/calculation-results/atom-selectors/selectors';
import { chartSources } from 'models/charts/charts/atom-selectors/selectors';
import { timeseriesSummaries } from 'models/charts/timeseries-results/selectors';
import { useRecoilValue } from 'recoil';

const ConnectedFileViewSourceTable = () => {
  const summaries = {
    ...useRecoilValue(timeseriesSummaries),
    ...useRecoilValue(calculationSummaries),
  };
  const sources = useRecoilValue(chartSources);

  return (
    <SourceTable
      mode="file"
      headerTranslations={useComponentTranslations(SourceTableHeader)}
      sources={sources}
      summaries={summaries}
    />
  );
};

export default ConnectedFileViewSourceTable;
