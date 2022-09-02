import { Button } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DocLinkButtonGroup = () => {
  const { t } = useTranslation('DataModelHeader');

  return (
    <Button
      aria-label={t('btn_link_cli_docs', 'Visit docs page')}
      href="https://pr-1279.docs.preview.cogniteapp.com/dev/concepts/resource_types/fdm/guides/manage_dm"
      type="ghost"
      icon="Documentation"
      target="_blank"
    />
  );
};
