import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { Body, Input } from '@cognite/cogs.js';
import { changeOptions } from 'modules/workflows';
import { OptionWrapper } from 'pages/PageOptions/components';

export const OptionMinTokens = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { minTokens } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );

  const onMinTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeOptions({ minTokens: Number(event.target.value) }));
  };

  return (
    <OptionWrapper>
      <Body level={2} strong>
        Number of tokens
      </Body>
      <Body level={2}>
        Each detected asset must match the matched entity on at least this
        number of tokens. That is, substrings of consecutive letters or
        consecutive digits.
      </Body>
      <Input
        type="number"
        name="minTokensOption"
        value={minTokens}
        min={1}
        step={1}
        onChange={onMinTokensChange}
        style={{ width: '240px', marginTop: '12px' }}
      />
    </OptionWrapper>
  );
};
