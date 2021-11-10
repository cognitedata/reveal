import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { Body, Switch } from '@cognite/cogs.js';
import { changeOptions } from 'modules/workflows';
import { useJobStarted } from 'hooks';
import { Flex } from 'components/Common';
import { OptionWrapper } from 'pages/PageOptions/components';

export const OptionPartialMatch = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { setJobStarted } = useJobStarted();
  const { partialMatch } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );

  const onPartialMatchesChange = (checked: boolean) => {
    dispatch(changeOptions({ partialMatch: checked }));
    setJobStarted(false);
  };

  return (
    <OptionWrapper>
      <Flex
        row
        style={{ width: '100%', marginBottom: '12px', marginLeft: '-8px' }}
      >
        <Switch
          name="partialMatchOption"
          value={partialMatch}
          onChange={onPartialMatchesChange}
        />
        <Body level={2} strong>
          Allow partial matches
        </Body>
      </Flex>
      <Flex row style={{ width: '100%', marginBottom: '12px' }}>
        <Body level={2}>
          Select this option to include matches where the diagrams tag names do
          not exactly match the asset tag name. CDF finds matches by comparing
          similar characters, such as 0 and O, 8 and B. Clear this option to
          allow only exact matches.
        </Body>
      </Flex>
    </OptionWrapper>
  );
};
