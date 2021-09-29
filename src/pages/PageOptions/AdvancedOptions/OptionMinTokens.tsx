import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { Body, Input } from '@cognite/cogs.js';
import { changeOptions } from 'modules/workflows';
import { Flex } from 'components/Common';
import { OptionWrapper } from 'pages/PageOptions/components';

export const OptionMinTokens = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { minTokens } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );
  const [value, setValue] = useState(minTokens ?? 2);

  const onMinTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  useEffect(() => {
    dispatch(changeOptions({ minTokens: value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
