import { useMemo } from 'react';

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';

import {
  CopilotDataModelSelectionResponse,
  CopilotMessage,
} from '../../../lib/types';
import { useDataModels } from '../../hooks/useDataModels';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const DataModelMessage = ({
  message: { data: message },
}: {
  message: {
    data: CopilotDataModelSelectionResponse;
  };
}) => {
  const { data: dataModels = [] } = useDataModels();

  const dataModelSelectedString = useMemo(
    () =>
      message.dataModels
        .map((el) =>
          dataModels.find(
            (model) =>
              model.externalId === el.dataModel &&
              model.version === el.version &&
              model.space === el.space
          )
        )
        .filter((el) => !!el)
        .map((el) => `- ${el!.name} <${el!.externalId}> [${el!.space}]`)
        .join('\n'),
    [message, dataModels]
  );

  return (
    <MessageBase message={message as CopilotMessage} hideActions>
      <Wrapper direction="column" gap={6}>
        <Markdown content={message.content + '\n' + dataModelSelectedString} />
      </Wrapper>
    </MessageBase>
  );
};

const Wrapper = styled(Flex)`
  #confirm {
    margin-top: 6px;
  }
`;
