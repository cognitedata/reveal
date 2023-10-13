import { useMemo } from 'react';

import { FdmMixerApiService } from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import { Body, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { CopilotDataModelQueryResponse } from '../../../lib/types';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const DataQueryMessage = ({
  message,
}: {
  message: {
    data: CopilotDataModelQueryResponse & { source: 'bot'; replyTo: number };
  };
}) => {
  const {
    data: { summary },
  } = message;

  const { data: result, isLoading } = useResults(message.data);
  return (
    <MessageBase
      message={{
        ...message.data,
      }}
    >
      <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
        <Markdown content={summary} />
        {isLoading && <Body size="x-small">Loading...</Body>}
        {result && (
          <Body size="x-small">
            {(Object.values(result.data as any)[0] as any).items.length} items
            found
          </Body>
        )}
      </Flex>
    </MessageBase>
  );
};

const useResults = (message: CopilotDataModelQueryResponse) => {
  const sdk = useSDK();

  const service = useMemo(() => new FdmMixerApiService(sdk), [sdk]);

  return useQuery([JSON.stringify(message)], () => {
    const result = service.runQuery({
      dataModelId: message.dataModel.externalId,
      space: message.dataModel.space,
      schemaVersion: message.dataModel.version,
      graphQlParams: message.graphql,
    });
    return result;
  });
};
