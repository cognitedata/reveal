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
          Select this option to allow detecting tags based on unique parts.
          E.g. if "12-AB-3456" is a tag, "12", "AB" and "3456" must all be found in the 
          diagram to get a detection if partial match is not enabled.
          With partial match enabled, if no other tag contains the combination 
          "AB-3456", the tag can be detected without finding "12".
        </Body>
      </Flex>
    </OptionWrapper>
  );
};
