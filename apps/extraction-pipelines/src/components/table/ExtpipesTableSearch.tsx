import React from 'react';

import { InputExp } from '@cognite/cogs.js';

import { useTranslation } from '@extraction-pipelines/common';

type ExtpipesTableSearchProps = {
  onChange: (value: string) => void;
  value: string;
};

const ExtpipesTableSearch = ({
  onChange,
  value,
}: ExtpipesTableSearchProps): JSX.Element => {
  const { t } = useTranslation();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const searchText = event?.target?.value;
    onChange(searchText);
  };

  return (
    <InputExp
      icon="Search"
      placeholder={t('search-by-name')}
      onChange={handleChange}
      value={value}
      clearable
    />
  );
};

export default ExtpipesTableSearch;
