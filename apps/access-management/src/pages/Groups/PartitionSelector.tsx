import React from 'react';

import { useTranslation } from '@access-management/common/i18n';
import Select from 'antd/lib/select';

interface PartitionSelectorProps {
  value: number[];
  onChange(newSelectedResources: number[]): void;
}

const PartitionSelector = ({
  value = [],
  onChange = () => {},
}: PartitionSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Select
      mode="tags"
      value={value}
      placeholder={t('partition-select-placeholder')}
      onChange={onChange}
    />
  );
};

export default PartitionSelector;
