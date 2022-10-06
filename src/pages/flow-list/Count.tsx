import { URL_SEARCH_QUERY_PARAM, useTranslation } from 'common';
import { useFlowList } from 'hooks/raw';
import { filterFlow, useUrlQuery } from 'utils';

export default function Count() {
  const { t } = useTranslation();
  const [query] = useUrlQuery(URL_SEARCH_QUERY_PARAM);
  const { data } = useFlowList();
  if (!data) {
    return null;
  }
  if (query) {
    const filteredCount = data.filter((flow) => filterFlow(flow, query)).length;
    return (
      <span>
        {t('list-search-filtered-count', { filteredCount, count: data.length })}
      </span>
    );
  }
  return <span>{t('list-search-count', { count: data.length })}</span>;
}
