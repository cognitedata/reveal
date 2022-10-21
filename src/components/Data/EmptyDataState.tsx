import { useTranslation } from 'common/i18n';
import EmptyState from 'components/EmptyState';
import { EXPLORE_DATA_CATALOG } from 'utils';

const EmptyDataState = () => {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: '10%' }}>
      <EmptyState
        type="DataSets"
        text={t('this-data-set-contains-no-data')}
        extra={
          <div>
            <a
              href={EXPLORE_DATA_CATALOG}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('click-here')}
            </a>{' '}
            {t('learn-more-how-to-add-data')}
          </div>
        }
      />
    </div>
  );
};

export default EmptyDataState;
