import { EmptyView } from '..';
import { useTranslation } from '../../hooks/useTranslation';

export const FilesView = () => {
  const { t } = useTranslation();

  return (
    <EmptyView
      body={t('no-files-help-body')}
      illustration="DocumentFile"
      title={t('no-files-help-title')}
    />
  );
};
