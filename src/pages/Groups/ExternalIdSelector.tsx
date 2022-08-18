import React from 'react';

import Select from 'antd/lib/select';
import { useTranslation } from 'common/i18n';
import { Input } from 'antd';

interface ExternalIdSelectorProps {
  value: number[];
  onChange(newSelectedResources: number[]): void;
}

const ExternalIdSelector = ({
  value = [],
  onChange = () => {},
}: ExternalIdSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Select
      mode="tags"
      value={value}
      placeholder={t('external-id-select-placeholder')}
      onChange={onChange}
    />
  );
};

export default ExternalIdSelector;
