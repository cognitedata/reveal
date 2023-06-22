import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Body, Input } from '@cognite/cogs.js';

import { Flex } from '../../../components/Common';
import { useJobStarted } from '../../../hooks';
import { changeOptions } from '../../../modules/workflows';
import { RootState } from '../../../store';
import { OptionWrapper } from '../components';

export const OptionMinTokens = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { setJobStarted } = useJobStarted();
  const { minTokens } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );
  const [value, setValue] = useState(minTokens ?? 2);

  const onMinTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  useEffect(() => {
    if (value !== minTokens) {
      dispatch(changeOptions({ minTokens: value }));
      setJobStarted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <OptionWrapper>
      <Body level={2} strong>
        Number of tokens
      </Body>
      <Body level={2}>
        Select how many tokens on each detected tag must match the tag on the
        diagram or asset. That is substrings of consecutive letters or
        consecutive digits.
      </Body>
      <Flex style={{ flex: 1, maxWidth: '240px', marginTop: '12px' }}>
        <Input
          type="number"
          name="minTokensOption"
          min={1}
          max={9999}
          step={1}
          value={value}
          setValue={setValue}
          onChange={onMinTokensChange}
          width={240}
        />
      </Flex>
    </OptionWrapper>
  );
};
