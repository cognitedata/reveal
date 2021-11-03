import React from 'react';
import { AllIconTypes, AutoComplete } from '@cognite/cogs.js';
import { DocumentSearchQuery } from 'services/types';
import { FilterProps } from 'pages/Document/components/Table/Filters/types';

interface Props extends FilterProps {
  title: string;
  filterKey: keyof DocumentSearchQuery;
  options?: { value: string | undefined; label: string }[];
  icon?: AllIconTypes;
  isLoading?: boolean;
}
export const Select: React.FC<Props> = ({
  title,
  onChange,
  options,
  filterKey,
  icon,
  isLoading,
}) => {
  const handleOnChange = (event: { value: string; label: string }) => {
    onChange({ [filterKey]: event?.value });
  };

  return (
    <AutoComplete
      icon={icon}
      isLoading={isLoading}
      isClearable
      onChange={handleOnChange}
      options={options}
      placeholder={title}
    />
  );
};
