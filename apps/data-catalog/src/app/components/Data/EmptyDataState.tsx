import { useTranslation } from '../../common/i18n';
import { EXPLORE_DATA_CATALOG } from '../../utils';
import EmptyState from '../EmptyState';

const EmptyDataState = () => {
  const { t } = useTranslation();
  return (
    <div style={{ marginTop: '10%' }}>
      <EmptyState
        type="Data"
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
