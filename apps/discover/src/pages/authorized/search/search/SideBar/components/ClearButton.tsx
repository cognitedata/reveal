import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';
import { DocumentsFacets } from 'modules/documentSearch/types';

export const ClearButton: React.FC<{
  activeKey: string;
  filters: DocumentsFacets;
  handleClearDate: () => void;
}> = (props) => {
  const { activeKey, filters, handleClearDate } = props;
  const { t } = useTranslation();

  const isLastCreatedOrLastModifiedFiltersActive = () => {
    return (
      (activeKey === 'lastcreated' && (filters.lastcreated || []).length > 0) ||
      (activeKey === 'lastmodified' && (filters.lastmodified || []).length > 0)
    );
  };

  if (!filters) {
    return <></>;
  }

  if (isLastCreatedOrLastModifiedFiltersActive()) {
    return (
      <Button
        type="ghost"
        onClick={handleClearDate}
        style={{ marginRight: '8px' }}
        aria-label={t('Clear')}
      >
        {t('Clear')}
      </Button>
    );
  }

  return <></>;
};
