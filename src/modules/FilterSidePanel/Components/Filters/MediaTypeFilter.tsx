import { Radio } from '@cognite/cogs.js';
import React from 'react';
import {
  MediaTypeOption,
  VisionFilterItemProps,
} from 'src/modules/FilterSidePanel/types';
import styled from 'styled-components';

export const MediaTypeFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    next?: string | boolean | undefined
  ) => {
    if (next) {
      setFilter({
        ...filter,
        mediaType: next as MediaTypeOption,
      });
    }
  };

  const getCheckedState = (
    option: MediaTypeOption,
    value?: MediaTypeOption
  ) => {
    if (value) {
      return option === value;
    }
    return false;
  };

  const MediaTypeRadioButton = ({
    option,
    value,
  }: {
    option: MediaTypeOption;
    value?: MediaTypeOption;
  }) => {
    return (
      <Radio
        value={option}
        label={option}
        checked={getCheckedState(option, value)}
        onChange={handleChange}
        key={option}
      >
        {option}
      </Radio>
    );
  };

  return (
    <OptionList>
      <MediaTypeRadioButton
        option={MediaTypeOption.image}
        value={filter.mediaType}
      />
      <MediaTypeRadioButton
        option={MediaTypeOption.video}
        value={filter.mediaType}
      />
    </OptionList>
  );
};

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 2px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px;
  gap: 5px;
`;
