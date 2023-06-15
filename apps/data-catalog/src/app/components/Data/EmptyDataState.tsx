import { useTranslation } from '@data-catalog-app/common/i18n';
import EmptyState from '@data-catalog-app/components/EmptyState';
import { EXPLORE_DATA_CATALOG } from '@data-catalog-app/utils';

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
