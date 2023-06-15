import React from 'react';

import { useTranslation } from '@extraction-pipelines/common';

import { InputExp } from '@cognite/cogs.js';

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
