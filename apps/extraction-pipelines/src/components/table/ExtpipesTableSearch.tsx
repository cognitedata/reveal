import React, { useState } from 'react';

import { Colors, Icon } from '@cognite/cogs.js';
import { Input } from 'antd';
import styled from 'styled-components';

import { useTranslation } from 'common';

type ExtpipesTableSearchProps = {
  onChange: (value: string) => void;
  value: string;
};

const ExtpipesTableSearch = ({
  onChange,
  value,
}: ExtpipesTableSearchProps): JSX.Element => {
  const { t } = useTranslation();

  const [isInputFocus, setInputFocus] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const searchText = event?.target?.value;
    onChange(searchText);
  };

  return (
    <StyledInput
      prefix={
        <Icon
          type="Search"
          style={{
            color: isInputFocus ? `${Colors['midblue-3']}` : 'inherit',
          }}
        />
      }
      placeholder={t('search-by-name')}
      onChange={handleChange}
      onFocus={() => setInputFocus(true)}
      onBlur={() => {
        setInputFocus(false);
      }}
      value={value}
      allowClear
    />
  );
};

const StyledInput = styled(Input)`
  width: 220px;
`;

export default ExtpipesTableSearch;
