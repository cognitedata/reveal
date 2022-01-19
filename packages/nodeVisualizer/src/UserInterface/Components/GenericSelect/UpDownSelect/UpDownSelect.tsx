import React from 'react';
import { ICommonSelectProps } from '@/UserInterface/Components/Settings/Types';
import { NumericUtils } from '@/UserInterface/Foundation/Utils/numericUtils';
import { Button, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

interface UpDownSelectProps extends ICommonSelectProps {
  node: React.ReactElement<ICommonSelectProps, any>;
}

export const UpDownSelect = (props: UpDownSelectProps) => {
  const { options, extraOptionsData, value, onChange, disabled, node } = props;
  const updateState = (updateVal: string) => {
    if (onChange) {
      onChange(updateVal);
    }
  };
  const handleChange = (event) => {
    if (event.target) {
      updateState(event.target.value);
    } else {
      updateState(event);
    }
  };

  const setPrevOption = () => {
    if (options) {
      const newIndex =
        NumericUtils.findIndexOfValueInOptions(options, value as string) - 1;
      if (newIndex < 0) return;
      updateState(options[newIndex].value);
    }
  };
  const setNextOption = () => {
    if (options) {
      const newIndex =
        NumericUtils.findIndexOfValueInOptions(options, value as string) + 1;
      if (newIndex >= options.length) return;
      updateState(options[newIndex].value);
    }
  };

  return (
    <UpDownSelectWrapper>
      {React.cloneElement(node, {
        options,
        value,
        onChange: handleChange,
        disabled,
        extraOptionsData,
      })}
      <UpDownButtonsGroup>
        <UpDownButton
          type="secondary"
          onClick={setNextOption}
          disabled={disabled}
        >
          <Icon type="CaretUp" />{' '}
        </UpDownButton>
        <UpDownButton
          type="secondary"
          onClick={setPrevOption}
          disabled={disabled}
        >
          <Icon type="CaretDown" />{' '}
        </UpDownButton>
      </UpDownButtonsGroup>
    </UpDownSelectWrapper>
  );
};

const UpDownSelectWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  border-width: 1px;
  border-style: solid;
  border-radius: 0;
  border-color: #b5b5b5;
  box-sizing: border-box;
`;
const UpDownButtonsGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const UpDownButton = styled(Button)`
  padding: 0 10px;
  border-radius: unset;
  width: 30px;
  height: 50%;
`;
