import { useState, useEffect } from 'react';

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';

import { CopilotAction } from '../../../lib/types';
import { useCopilotContext } from '../../hooks/useCopilotContext';
import { scrollToBottom } from '../../utils/scrollToBottom';
import { ResponsiveActions } from '../MessageRenderer/components/ResponsiveActions';

export const ChainSelectionActionRenderer = () => {
  const { availableFlows, runFlow } = useCopilotContext();

  useEffect(() => {
    scrollToBottom();
  }, []);

  const [actions, setActions] = useState<CopilotAction[]>([]);

  useEffect(() => {
    setActions(
      availableFlows.map((el) => ({
        content: el.label,
        onClick: () => {
          runFlow(el, undefined, false);
        },
      }))
    );
  }, [availableFlows, runFlow]);

  return (
    <Wrapper
      gap={8}
      direction="column"
      style={{ position: 'relative', width: '100%' }}
    >
      <ResponsiveActions actions={actions} />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;
