import { useState, useEffect } from 'react';

import styled from 'styled-components';

import { useBotUI, useBotUIAction } from '@botui/react';

import { Flex } from '@cognite/cogs.js';

import { CogniteBaseChain } from '../../../lib/CogniteBaseChain';
import { CopilotAction } from '../../../lib/types';
import { ResponsiveActions } from '../MessageRenderer/components/ResponsiveActions';

export const ChainSelectionAction = () => {
  const textActionProps = useBotUIAction();

  const {
    meta: { excludeChains, chains },
  } = textActionProps!;

  const [actions, setActions] = useState<CopilotAction[]>([]);

  const bot = useBotUI(); // current instance
  useEffect(() => {
    setActions(
      Object.values(chains as { [key in string]: CogniteBaseChain })
        .filter(
          (el) => !(excludeChains as string[]).includes(el.constructor.name)
        )
        .map((el) => ({
          content: el.name,
          onClick: () => {
            bot.next(
              { content: el.constructor.name },
              { messageType: 'chain' }
            );
          },
        }))
    );
  }, [chains, excludeChains, bot]);

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
