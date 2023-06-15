import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Flex } from '@interactive-diagrams-app/components/Common';
import { useJobStarted } from '@interactive-diagrams-app/hooks';
import { changeOptions } from '@interactive-diagrams-app/modules/workflows';
import { OptionWrapper } from '@interactive-diagrams-app/pages/PageOptions/components';
import { RootState } from '@interactive-diagrams-app/store';

import { Body, Switch } from '@cognite/cogs.js';

export const OptionPartialMatch = ({ workflowId }: { workflowId: number }) => {
  const dispatch = useDispatch();
  const { setJobStarted } = useJobStarted();
  const { partialMatch } = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );

  return (
    <OptionWrapper>
      <Flex row style={{ width: '100%', marginBottom: '12px' }}>
        <Switch
          label="Allow partial matches"
          name="partialMatchOption"
          value={partialMatch}
          onChange={(_e: any, nextState: boolean) => {
            dispatch(changeOptions({ partialMatch: nextState }));
            setJobStarted(false);
          }}
        />
      </Flex>
      <Flex row style={{ width: '100%', marginBottom: '12px' }}>
        <Body level={2}>
          Select this option to allow detecting tags based on unique parts. E.g.
          if 12-AB-3456 is a tag, 12, AB and 3456 must all be found in the
          diagram to get a detection if partial match is not enabled. With
          partial match enabled, if no other tag contains the combination of AB
          and 3456, the tag can be detected without finding 12.
        </Body>
      </Flex>
    </OptionWrapper>
  );
};
