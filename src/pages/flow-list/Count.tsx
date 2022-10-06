import { useTranslation } from 'common';
import { useFlowList } from 'hooks/raw';

export default function Count() {
  const { t } = useTranslation();
  const { data } = useFlowList();
  if (!data) {
    return null;
  }
  return <span>{t('list-search-count', { count: data.length })}</span>;
}
